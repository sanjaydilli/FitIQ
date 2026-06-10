#!/usr/bin/env python3
"""Calculate per-serving macros for every recipe in recipes.csv.

Reads   : recipe_url_pipeline/recipes.csv  (dish, ingredients JSON)
Matches : frontend/src/data/indianFoods.ts (IFCT 2017 database)
Writes  : scripts/recipe_macros.csv

Usage: python3 scripts/calculateRecipeMacros.py
"""

from __future__ import annotations

import csv
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT        = Path(__file__).resolve().parent.parent
RECIPES_CSV = ROOT / "recipe_url_pipeline" / "recipes.csv"
FOODS_TS    = ROOT / "frontend" / "src" / "data" / "indianFoods.ts"
OUTPUT_CSV  = Path(__file__).resolve().parent / "recipe_macros.csv"
SERVINGS    = 4
COOKING_LOSS = 0.85   # retain 85% after cooking


# ── Parse indianFoods.ts → lookup dict ───────────────────────────────────────

@dataclass
class FoodEntry:
    id: str
    name: str
    name_hindi: str
    name_tamil: str
    name_kannada: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    iron: float
    is_vegetarian: bool


def parse_ifct(ts_path: Path) -> list[FoodEntry]:
    text = ts_path.read_text(encoding="utf-8")

    # Each food entry starts with: id: 'XXXX', — split on that boundary
    # This avoids false splits inside servingSizes/cookingMethods arrays
    blocks = re.split(r"(?=\n\s*\{\s*\n\s*id\s*:)", text)

    entries: list[FoodEntry] = []

    def val(block: str, key: str) -> str:
        m = re.search(rf"^\s*{key}\s*:\s*'([^']*)'", block, re.MULTILINE)
        return m.group(1).strip() if m else ""

    def num(block: str, key: str) -> float:
        m = re.search(rf"^\s*{key}\s*:\s*([\d.]+)", block, re.MULTILINE)
        return float(m.group(1)) if m else 0.0

    def boolean(block: str, key: str) -> bool:
        m = re.search(rf"^\s*{key}\s*:\s*(true|false)", block, re.MULTILINE)
        return m.group(1) == "true" if m else False

    for block in blocks:
        if "per100g" not in block:
            continue
        entry = FoodEntry(
            id            = val(block, "id"),
            name          = val(block, "name"),
            name_hindi    = val(block, "nameHindi"),
            name_tamil    = val(block, "nameTamil"),
            name_kannada  = val(block, "nameKannada"),
            calories      = num(block, "calories"),
            protein       = num(block, "protein"),
            carbs         = num(block, "carbs"),
            fat           = num(block, "fat"),
            fiber         = num(block, "fiber"),
            iron          = num(block, "iron"),
            is_vegetarian = boolean(block, "isVegetarian"),
        )
        if entry.id:
            entries.append(entry)

    return entries


def build_lookup(entries: list[FoodEntry]) -> dict[str, FoodEntry]:
    """Build keyword → FoodEntry map from all name variants."""
    lookup: dict[str, FoodEntry] = {}

    def add(token: str, entry: FoodEntry) -> None:
        token = token.strip().lower()
        if len(token) >= 3 and token not in lookup:
            lookup[token] = entry

    for e in entries:
        for name in [e.name, e.name_hindi, e.name_tamil, e.name_kannada]:
            if not name:
                continue
            add(name, e)
            # also index individual words (≥4 chars)
            for word in re.split(r"[\s,/]+", name):
                if len(word) >= 4:
                    add(word, e)

    return lookup


# ── Unit → grams conversion ───────────────────────────────────────────────────

# ingredient_category is derived from ingredient name keywords
GRAIN_WORDS   = {"rice", "dal", "rava", "semolina", "flour", "atta", "maida",
                 "poha", "oats", "ragi", "bajra", "jowar", "barley", "quinoa",
                 "besan", "suji", "idli", "dosa", "sooji"}
LIQUID_WORDS  = {"milk", "water", "juice", "oil", "ghee", "buttermilk", "curd",
                 "yogurt", "dahi", "chaas", "cream", "coconut water", "broth"}
FLOUR_WORDS   = {"flour", "atta", "maida", "besan"}


def ingredient_category(name: str) -> str:
    n = name.lower()
    if any(w in n for w in FLOUR_WORDS):
        return "flour"
    if any(w in n for w in GRAIN_WORDS):
        return "grain"
    if any(w in n for w in LIQUID_WORDS):
        return "liquid"
    return "other"


CUP_GRAMS = {"liquid": 240, "grain": 185, "flour": 120, "other": 150}

UNIT_TO_GRAMS: dict[str, float | None] = {
    # context-dependent → None means use CUP_GRAMS dict
    "cup": None,
    "tbsp": 15,
    "tsp": 5,
    "g": 1,
    "gram": 1,
    "grams": 1,
    "kg": 1000,
    "ml": 1,
    "l": 1000,
    "pinch": 0.3,
    "inch": 5,       # ginger
    "clove": 5,      # garlic
    "piece": 60,
    "pieces": 60,
    "slice": 20,
    "slices": 20,
    "bunch": 30,
    "sprig": 4,
    "medium": 100,   # onion / tomato
    "large": 150,
    "small": 60,
    "packet": 100,
    "can": 400,
}

WHOLE_ITEM_GRAMS: dict[str, float] = {
    "onion": 100, "tomato": 80, "potato": 120, "egg": 55,
    "banana": 100, "lemon": 60, "lime": 60, "garlic": 5,
    "chilli": 10, "green chilli": 10, "red chilli": 3,
    "carrot": 80, "capsicum": 100, "ginger": 5,
}

# ── Standardisation: trace items + aliases ────────────────────────────────────

# Nutritionally negligible — skipped silently, NOT counted as unmatched
NEGLIGIBLE = {
    "salt", "black salt", "rock salt", "sea salt", "water", "hot water",
    "warm water", "cold water", "ice", "ice cube", "ice cubes",
    "baking soda", "baking powder", "eno", "vanilla extract",
    "vanilla essence", "essence", "saffron", "saffron strand",
    "saffron strands", "food color", "food colour", "ajinomoto",
    "asafoetida", "hing", "mixed herb", "mixed herbs", "dried herbs",
    "oregano", "shahi jeera", "dried oregano", "thyme", "rosemary",
    "bay leaf", "bay leaves", "star anise", "food essence",
    # herbs & trace spices (used in gram-trivial amounts)
    "basil", "basil leaves", "herb", "herbs", "dry oregano",
    "italian seasoning", "allspice", "rose petal", "rose petals",
    "kalpasi", "shah jeera", "kalonji", "nigella seeds", "gond",
    # leavening / flavour agents — a tsp has negligible macros
    "yeast", "dry yeast", "instant yeast", "active dry yeast",
    "dry active yeast", "instant coffee", "coffee powder",
    "rose water", "kewra water",
    # trace exotics & colouring/souring agents
    "edible camphor", "maratti moggu", "marathi moggu",
    "saffron food colour", "strands of saffron",
    "pure vanilla extract", "real vanilla extract",
    "soda-bi-carbonate", "soda bi carbonate", "castor oil",
    "italian herb", "cinammon stick", "cinnamon stick",
    "peri peri seasoning", "sweetener", "aloe vera", "kokum",
    "sabja", "allspice", "all spice", "panch phoron", "vanilla",
    "agar agar", "agar agar strand", "agar agar sheet",
    "peppercorn", "sichuan peppercorn", "wheatgras", "wheatgrass",
    "manathakkali vathal", "sundakkai vathal", "dry rose petal",
    "red food colour", "five spice", "cajun seasoning",
    "pizza seasoning", "multani mitti", "coffee", "stock cube",
    "stock", "dry thyme", "dry basil", "aloe vera gel",
}

# Common scraper artifacts → corrected name (applied before matching)
SCRAPER_FIXES = {
    "to mato": "tomato",
    "potatoes and": "potato",
    "mangoe": "mango",
    "strawberrie": "strawberry",
    "cashewnut": "cashew nut",
    "gingely oil": "gingelly oil",
    "shahjeera": "shahi jeera",
    "blueberrie": "blueberry",
    "to matoe": "tomato",
    "asafoedita": "asafoetida",
    "asafetida": "asafoetida",
    "chikpea": "chickpea",
    "idlie": "idli",
    "cranberrie": "cranberry",
    "caspcium": "capsicum",
    "rocksalt": "salt",
    "bayleave": "bay leaf",
    "marati moggu": "maratti moggu",
    "italiann herb": "italian herb",
    "all-spice": "allspice",
}

# Condiments with no IFCT entry — see SYNTHETIC below for values

# Scraped ingredient name → exact IFCT name (checked before fuzzy matching)
ALIASES = {
    "besan": "bengal gram, dal",
    "gram flour": "bengal gram, dal",
    "egg": "egg, poultry, whole, raw",
    "eggs": "egg, poultry, whole, raw",
    "red chili": "chillies, red",
    "red chilli": "chillies, red",
    "dry red chili": "chillies, red",
    "dry red chilli": "chillies, red",
    "dried red chili": "chillies, red",
    "green chili": "chillies, green - all varieties",
    "green chilli": "chillies, green - all varieties",
    "pea": "peas, fresh",
    "peas": "peas, fresh",
    "green pea": "peas, fresh",
    "green peas": "peas, fresh",
    "bun": "bread",
    "pav": "bread",
    "shallot": "onion, small",
    "shallots": "onion, small",
    "aamchur": "mango, green, raw",
    "amchur": "mango, green, raw",
    "dry mango powder": "mango, green, raw",
    "olive oil": "sunflower oil",
    "oil": "sunflower oil",
    "cooking oil": "sunflower oil",
    "vegetable oil": "sunflower oil",
    "refined oil": "sunflower oil",
    "beetroot": "beet root",
    "yogurt": "curd",
    "plain yogurt": "curd",
    "greek yogurt": "curd",
    "hung curd": "curd",
    "buttermilk": "curd",
    "butter milk": "curd",
    "chaas": "curd",
    "date": "dates, dry, pale brown",
    "dates": "dates, dry, pale brown",
    # dals & legumes — regional names
    "channa dal": "bengal gram, dal",
    "chana dal": "bengal gram, dal",
    "chickpea": "bengal gram, whole",
    "chickpeas": "bengal gram, whole",
    "kabuli chana": "bengal gram, whole",
    "chole": "bengal gram, whole",
    "rajma": "rajmah, red",
    "kidney beans": "rajmah, red",
    "tuvar dal": "red gram, dal",
    "toor dal": "red gram, dal",
    "arhar dal": "red gram, dal",
    # produce & proteins
    "okra": "ladies finger",
    "bhindi": "ladies finger",
    "mutton": "sheep, leg",
    "lamb": "sheep, leg",
    "prawn": "prawns, big",
    "prawns": "prawns, big",
    "shrimp": "prawns, big",
    "khoya": "khoa",
    "mawa": "khoa",
    "javetri": "mace",
    "almonds": "almond",
    "cashews": "cashew nut",
    "cashew nuts": "cashew nut",
    "nut": "cashew nut",
    "nuts": "cashew nut",
    "mixed nuts": "cashew nut",
    "jalapeno": "chillies, green - all varieties",
    "paprika": "chillies, red",
    "breadcrumb": "bread",
    "breadcrumbs": "bread",
    "bread crumbs": "bread",
    "hot oil": "sunflower oil",
    "galangal": "ginger",
    "dal": "red gram, dal",
    "flaxseed": "linseeds",
    "flax seed": "linseeds",
    "flaxseeds": "linseeds",
    "murmura": "rice puffed",
    "puffed rice": "rice puffed",
    "watermelon": "water melon, pale green",
    "burger bun": "bread",
    "buns": "bread",
    "tindora": "kovai, small",
    "khus khu": "poppy seeds",
    "khus khus": "poppy seeds",
    "jackfruit": "jack fruit, raw",
    "raw jackfruit": "jack fruit, raw",
    "pearl millet": "bajra",
    "foxtail millet": "bajra",
    "millet": "bajra",
    "sorghum": "jowar",
    "red sorghum": "jowar",
    "mozzarella": "cheese",
    "parmesan": "cheese",
    "arbi": "colocasia",
    "bottlegourd": "bottle gourd, elongate, pale green",
    "avarakkai": "broad beans",
    "seviyan": "wheat, vermicelli, roasted",
    "tur dal": "red gram, dal",
    "khajoor": "dates, dry, pale brown",
    "dry khajoor": "dates, dry, pale brown",
    "thatta payiru": "cowpea, brown",
    "scallion": "onion, stalk",
    "scallions": "onion, stalk",
    "spring onion": "onion, stalk",
    "keema": "sheep, leg",
    "javitri": "mace",
    "kalkandu": "sugar",
    "mishri": "sugar",
    "panko crumb": "bread",
    "panko": "bread",
    "multi grain bun": "bread",
    "slider bun": "bread",
    "seeraga samba": "rice, parboiled, milled",
}

# Condiments with no IFCT entry — approximate per-100g values
# (calories, protein, carbs, fat)
SYNTHETIC: dict[str, tuple[float, float, float, float]] = {
    "vinegar":    (21, 0.0, 0.9, 0.0),
    "soy sauce":  (53, 8.1, 4.9, 0.6),
    "soya sauce": (53, 8.1, 4.9, 0.6),
    "mayonnaise": (680, 1.0, 0.6, 75.0),
    "tomato ketchup": (101, 1.0, 25.0, 0.1),
    "ketchup":    (101, 1.0, 25.0, 0.1),
    # processed / non-IFCT items (per-100g approximations)
    "cornstarch": (381, 0.3, 91.0, 0.1),
    "corn starch": (381, 0.3, 91.0, 0.1),
    "cornflour":  (381, 0.3, 91.0, 0.1),
    "noodles":    (350, 11.0, 72.0, 1.5),
    "spaghetti":  (350, 12.5, 71.0, 1.5),
    "macaroni":   (350, 12.5, 71.0, 1.5),
    "pasta":      (350, 12.5, 71.0, 1.5),
    "pizza sauce":    (80, 1.5, 12.0, 2.5),
    "schezwan sauce": (120, 2.0, 18.0, 5.0),
    "tutti frutti":   (300, 0.2, 78.0, 0.2),
    "chocolate chip": (480, 4.2, 63.0, 24.0),
    "chocolate":      (530, 5.0, 60.0, 30.0),
    "cocoa powder":   (228, 19.6, 57.9, 13.7),
    "maple syrup":    (260, 0.0, 67.0, 0.0),
    "red wine":       (85, 0.1, 2.6, 0.0),
    "white wine":     (82, 0.1, 2.6, 0.0),
    "makhana":        (347, 9.7, 76.9, 0.1),
    "fox nut":        (347, 9.7, 76.9, 0.1),
    "boondi":         (450, 10.0, 50.0, 22.0),
    "papdi":          (500, 8.0, 55.0, 28.0),
    "dosa batter":    (150, 4.0, 30.0, 1.0),
    "idli batter":    (130, 4.0, 27.0, 0.5),
    "strawberry":     (32, 0.7, 7.7, 0.3),
    "broccoli":       (34, 2.8, 7.0, 0.4),
    "vegetable":      (45, 2.0, 8.0, 0.3),
    "vegetables":     (45, 2.0, 8.0, 0.3),
    "veggie":         (45, 2.0, 8.0, 0.3),
    "mixed vegetable":(45, 2.0, 8.0, 0.3),
    "mix vegetable":  (45, 2.0, 8.0, 0.3),
    "mixed veggie":   (45, 2.0, 8.0, 0.3),
    "olive":          (145, 1.0, 3.8, 15.3),
    "olives":         (145, 1.0, 3.8, 15.3),
    "tofu":           (76, 8.1, 1.9, 4.8),
    "putani":         (370, 19.5, 58.0, 5.2),
    "roasted gram":   (370, 19.5, 58.0, 5.2),
    "blueberry":      (57, 0.7, 14.5, 0.3),
    "rose syrup":     (260, 0.0, 65.0, 0.0),
    "rooh afza":      (260, 0.0, 65.0, 0.0),
    "tortilla":       (310, 8.5, 52.0, 7.0),
    "idli":           (132, 4.0, 27.0, 0.5),
    "chapati":        (297, 10.0, 46.0, 7.5),
    "roti":           (297, 10.0, 46.0, 7.5),
    "hot sauce":      (30, 1.0, 5.0, 0.5),
    "puff pastry":    (550, 7.0, 45.0, 38.0),
    "cacao nib":      (600, 14.0, 34.0, 50.0),
    "samosa":         (308, 5.0, 32.0, 17.0),
    "chironji":       (656, 19.0, 12.0, 59.0),
    "sattu":          (370, 19.5, 58.0, 5.2),
    "mirin":          (230, 0.2, 43.0, 0.0),
    "cranberry":      (46, 0.4, 12.0, 0.1),
    "berry":          (50, 1.0, 12.0, 0.3),
    "berrie":         (50, 1.0, 12.0, 0.3),
    "nutella":        (539, 6.0, 57.0, 31.0),
    "oreo":           (480, 5.0, 69.0, 20.0),
    "choco chip":     (480, 4.2, 63.0, 24.0),
    "worcestershire sauce": (78, 0.0, 19.0, 0.0),
    "sriracha sauce": (93, 2.0, 19.0, 1.0),
    "mayo":           (680, 1.0, 0.6, 75.0),
    "papad":          (370, 18.0, 60.0, 3.0),
    "bhel mix":       (500, 10.0, 55.0, 28.0),
    "churumuri":      (450, 9.0, 60.0, 20.0),
    "mixture":        (500, 10.0, 55.0, 28.0),
    "ragda":          (120, 6.0, 18.0, 2.5),
    "aloo bhaji":     (130, 2.5, 18.0, 5.5),
    "guacamole":      (160, 2.0, 9.0, 15.0),
    "chutney":        (90, 2.0, 8.0, 5.5),
    "spring roll":    (290, 8.0, 58.0, 1.5),
}


def get_synthetic(norm: str) -> tuple[float, float, float, float] | None:
    """Exact synthetic match, then substring (longest keys first)."""
    hit = SYNTHETIC.get(norm)
    if hit:
        return hit
    for key in sorted(SYNTHETIC, key=len, reverse=True):
        if len(key) >= 5 and key in norm:
            return SYNTHETIC[key]
    return None


# ── Last-resort category fallback ─────────────────────────────────────────────
# Guarantees every ingredient resolves. Returns None → skip (non-food/trace),
# else a generic (cal, protein, carbs, fat) per-100g profile.

_TRACE_HINTS = (
    "seasoning", "masala", "spice", "herb", "leaf", "leaves", "extract",
    "essence", "colour", "color", "attar", "vathal", "peppercorn", "saffron",
    "pinch", "drops", "strand", "agar", "yeast", "soda", "eno", "salt",
    "mitti", "slicer", "tray", "colander", "vanilla", "stock", "camphor",
    "baking", "vinegar", "tin", "bowl", "liquid", "water",
)

_CATEGORY_PROFILES: list[tuple[tuple[str, ...], tuple[float, float, float, float]]] = [
    (("sauce", "chutney", "dip", "ketchup"),                       (80, 1.5, 11.0, 3.0)),
    (("cheese", "cheddar"),                                        (300, 22.0, 3.0, 23.0)),
    (("biscuit", "cookie", "choco", "candy", "sweet", "halwa",
      "jam", "syrup", "toffee"),                                   (480, 5.0, 63.0, 22.0)),
    (("bun", "bread", "pav", "wrapper", "sheet", "parotta",
      "paratha", "roti", "naan", "crumb", "toast", "pita"),        (300, 9.0, 50.0, 6.0)),
    (("chicken", "mutton", "fish", "meat", "lamb", "pork",
      "beef", "egg"),                                              (180, 18.0, 2.0, 11.0)),
    (("paneer", "khoya", "cream", "milk", "curd", "yogurt",
      "butter", "malai"),                                          (150, 6.0, 6.0, 11.0)),
    (("dal", "bean", "payiru", "chana", "gram", "sprout",
      "legume", "peanut", "lentil"),                               (340, 22.0, 57.0, 4.0)),
    (("rava", "sooji", "flour", "atta", "samba", "rice", "oats",
      "poha", "batter", "noodle", "pasta", "macaroni", "semiya",
      "sevai", "grain", "idli", "dosa"),                           (350, 10.0, 72.0, 2.0)),
    (("berry", "berrie", "fruit", "apple", "grape", "date",
      "mango", "banana", "melon", "kiwi", "pomegranate", "pear"),  (60, 0.8, 14.0, 0.3)),
    (("nut", "badam", "kaju", "pista", "seed", "til"),             (570, 18.0, 22.0, 48.0)),
    (("gourd", "kkai", "keerai", "bhaji", "veg", "onion",
      "scallion", "drumstick", "capsicum", "carrot", "greens"),    (35, 1.8, 6.5, 0.3)),
]

_GENERIC_FOOD = (120.0, 3.5, 16.0, 4.5)


def classify_fallback(norm: str) -> tuple[float, float, float, float] | None:
    """None = skip silently; otherwise an approximate per-100g profile."""
    if any(w in norm for w in _TRACE_HINTS):
        return None
    if re.search(r"\boil\b", norm):
        return (884.0, 0.0, 0.0, 100.0)
    if re.search(r"\bghee\b", norm):
        return (900.0, 0.0, 0.0, 100.0)
    for keys, prof in _CATEGORY_PROFILES:
        if any(k in norm for k in keys):
            return prof
    return _GENERIC_FOOD


def normalize_name(name: str) -> str:
    n = name.strip().lower()
    n = re.sub(r"\bchil(?:y|i|ie|ly)\b", "chilli", n)   # chili/chily/chilly → chilli
    n = re.sub(r"\s+", " ", n)
    n = re.sub(r"\s+and$", "", n)                    # "potatoes and" → "potatoes"
    n = SCRAPER_FIXES.get(n, n)
    # apply word-level scraper fixes too ("ripe mangoe" → "ripe mango")
    words = n.split()
    n = " ".join(SCRAPER_FIXES.get(w, w) for w in words)
    return n


def name_variants(phrase: str) -> list[str]:
    """Singular/plural spellings to try against the lookup."""
    out = [phrase]
    if phrase.endswith("ies"):
        out.append(phrase[:-3] + "y")
    if phrase.endswith("es"):
        out.append(phrase[:-2])
    if phrase.endswith("s"):
        out.append(phrase[:-1])
    else:
        out.append(phrase + "s")
    if phrase.endswith("e"):
        out.append(phrase[:-1])      # "mangoe" → "mango"
    return out


def to_grams(amount: float, unit: str, ingredient_name: str) -> float:
    unit = unit.strip().lower()
    cat  = ingredient_category(ingredient_name)

    if unit == "cup":
        return amount * CUP_GRAMS.get(cat, 150)

    grams_per_unit = UNIT_TO_GRAMS.get(unit)
    if grams_per_unit is not None:
        return amount * grams_per_unit

    # No unit — treat amount as count of whole items
    for key, g in WHOLE_ITEM_GRAMS.items():
        if key in ingredient_name.lower():
            return amount * g
    # Generic count: assume 50g each
    return amount * 50


# ── Amount parser ─────────────────────────────────────────────────────────────

def parse_amount(s: str) -> float:
    s = s.strip()
    if not s:
        return 0.0
    s = re.split(r"[-–]", s)[0].strip()   # range → take lower
    parts = s.split()
    total = 0.0
    for p in parts:
        if "/" in p:
            try:
                n, d = p.split("/", 1)
                total += float(n) / float(d)
            except (ValueError, ZeroDivisionError):
                pass
        else:
            try:
                total += float(p)
            except ValueError:
                pass
    return total


# ── Ingredient → IFCT match ───────────────────────────────────────────────────

def match_ingredient(name: str, lookup: dict[str, FoodEntry]) -> FoodEntry | None:
    name_lower = normalize_name(name)

    # Alias table first (exact, standardised names)
    alias_target = ALIASES.get(name_lower)
    if alias_target and alias_target in lookup:
        return lookup[alias_target]

    # Substring alias pass — catches "extra virgin olive oil" via "olive oil"
    # (longest keys first so "green chilli" wins over "chilli")
    for key in sorted(ALIASES, key=len, reverse=True):
        if len(key) >= 4 and key in name_lower:
            target = ALIASES[key]
            if target in lookup:
                return lookup[target]

    # Try slash variants (e.g. "urad dal / split black gram")
    parts = [p.strip() for p in re.split(r"\s*/\s*", name_lower)]

    candidates: list[tuple[int, FoodEntry]] = []

    for part in parts:
        # Exact match first (with singular/plural variants)
        for v in name_variants(part):
            if v in lookup:
                return lookup[v]

        # Try progressively shorter substrings
        tokens = re.split(r"[\s,\-]+", part)
        for length in range(len(tokens), 0, -1):
            for start in range(len(tokens) - length + 1):
                phrase = " ".join(tokens[start:start + length])
                for v in name_variants(phrase):
                    if v in lookup:
                        candidates.append((length, lookup[v]))
                        break

    if candidates:
        candidates.sort(key=lambda x: -x[0])
        return candidates[0][1]

    # Fuzzy fallback — catches typos ("gingely oil" → "gingelly oil").
    # Conservative cutoff; only for reasonably long names.
    if len(name_lower) >= 5:
        cached = _fuzzy_cache.get(name_lower, "MISS")
        if cached != "MISS":
            return cached
        import difflib
        hits = difflib.get_close_matches(name_lower, _fuzzy_keys(lookup), n=1, cutoff=0.86)
        result = lookup[hits[0]] if hits else None
        _fuzzy_cache[name_lower] = result
        return result

    return None


_fuzzy_cache: dict = {}
_fuzzy_key_list: list[str] | None = None


def _fuzzy_keys(lookup: dict) -> list[str]:
    global _fuzzy_key_list
    if _fuzzy_key_list is None:
        _fuzzy_key_list = list(lookup.keys())
    return _fuzzy_key_list


# ── Main calculator ───────────────────────────────────────────────────────────

@dataclass
class RecipeMacros:
    id: str
    name: str
    servings: int
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    fiber_per_serving: float
    iron_per_serving: float
    is_vegetarian: bool
    ingredients_count: int
    grams_per_serving: float = 0.0
    unmatched_ingredients: list[str] = field(default_factory=list)
    approximated_ingredients: list[str] = field(default_factory=list)


def calculate_recipe(
    dish: str,
    ingredients: list[dict],
    lookup: dict[str, FoodEntry],
    servings: int | None = None,
) -> RecipeMacros:
    total = {"calories": 0.0, "protein": 0.0, "carbs": 0.0,
             "fat": 0.0, "fiber": 0.0, "iron": 0.0}
    unmatched: list[str] = []
    approximated: list[str] = []
    is_vegetarian = True
    total_grams = 0.0

    for ing in ingredients:
        name   = ing.get("ingredient", "").strip()
        unit   = ing.get("unit", "").strip()
        amount = parse_amount(ing.get("amount", ""))

        if not name or amount == 0:
            continue

        norm = normalize_name(name)

        # Trace ingredients: contribute nothing, not an error
        if norm in NEGLIGIBLE:
            continue

        grams = to_grams(amount, unit, name)

        # Synthetic condiments (no IFCT entry)
        syn = get_synthetic(norm)
        if syn is not None:
            factor = (grams / 100) * COOKING_LOSS
            total["calories"] += syn[0] * factor
            total["protein"]  += syn[1] * factor
            total["carbs"]    += syn[2] * factor
            total["fat"]      += syn[3] * factor
            total_grams += grams
            continue

        entry = match_ingredient(name, lookup)
        if entry is None:
            # Last resort: category profile or silent skip — never unmatched
            prof = classify_fallback(norm)
            if prof is None:
                continue
            factor = (grams / 100) * COOKING_LOSS
            total["calories"] += prof[0] * factor
            total["protein"]  += prof[1] * factor
            total["carbs"]    += prof[2] * factor
            total["fat"]      += prof[3] * factor
            total_grams += grams
            approximated.append(name)
            continue

        factor = (grams / 100) * COOKING_LOSS
        total_grams += grams

        total["calories"] += entry.calories * factor
        total["protein"]  += entry.protein  * factor
        total["carbs"]    += entry.carbs    * factor
        total["fat"]      += entry.fat      * factor
        total["fiber"]    += entry.fiber    * factor
        total["iron"]     += entry.iron     * factor

        if not entry.is_vegetarian:
            is_vegetarian = False

    # ── Standardised servings estimate ────────────────────────────────────
    # Old behaviour: every dish = 4 servings, which made big-batch dishes
    # (biryani, batters) look like 3000+ kcal/serving. Instead estimate
    # servings from total raw weight (~400 g/serving) and clamp so a single
    # serving stays in a plausible calorie range (≤ ~900 kcal).
    if servings is None:
        by_weight = max(1, round(total_grams / 400))
        by_cal    = max(1, -(-int(total["calories"]) // 900))  # ceil division
        servings  = min(16, max(by_weight, by_cal))

    dish_id = re.sub(r"[^a-z0-9]+", "_", dish.lower()).strip("_")

    return RecipeMacros(
        id                    = dish_id,
        name                  = dish,
        servings              = servings,
        calories_per_serving  = round(total["calories"] / servings, 1),
        protein_per_serving   = round(total["protein"]  / servings, 1),
        carbs_per_serving     = round(total["carbs"]    / servings, 1),
        fat_per_serving       = round(total["fat"]      / servings, 1),
        fiber_per_serving     = round(total["fiber"]    / servings, 1),
        iron_per_serving      = round(total["iron"]     / servings, 2),
        is_vegetarian         = is_vegetarian,
        ingredients_count     = len(ingredients),
        grams_per_serving     = round(total_grams / servings) if servings else 0,
        unmatched_ingredients = unmatched,
        approximated_ingredients = approximated,
    )


def main() -> None:
    if not RECIPES_CSV.exists():
        sys.exit(f"recipes.csv not found at {RECIPES_CSV}")
    if not FOODS_TS.exists():
        sys.exit(f"indianFoods.ts not found at {FOODS_TS}")

    print("Parsing IFCT database from indianFoods.ts ...")
    entries = parse_ifct(FOODS_TS)
    lookup  = build_lookup(entries)
    print(f"  {len(entries)} foods loaded → {len(lookup)} lookup tokens")

    print(f"\nReading {RECIPES_CSV} ...")
    rows: list[dict] = []
    with RECIPES_CSV.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    print(f"  {len(rows)} recipes found")

    results:  list[RecipeMacros] = []
    success   = 0
    failed    = 0
    all_unmatched: list[str] = []

    for row in rows:
        dish = row.get("dish", "").strip()
        try:
            ingredients = json.loads(row.get("ingredients", "[]"))
        except json.JSONDecodeError:
            ingredients = []

        if not dish or not ingredients:
            failed += 1
            continue

        macros = calculate_recipe(dish, ingredients, lookup)
        results.append(macros)

        if macros.calories_per_serving > 0:
            success += 1
        else:
            failed += 1

        all_unmatched.extend(macros.unmatched_ingredients)

    # Write output CSV
    fieldnames = [
        "id", "name", "servings",
        "calories_per_serving", "protein_per_serving",
        "carbs_per_serving", "fat_per_serving",
        "fiber_per_serving", "iron_per_serving",
        "isVegetarian", "ingredients_count", "grams_per_serving",
        "unmatched_ingredients", "approximated_ingredients",
    ]
    with OUTPUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow({
                "id":                    r.id,
                "name":                  r.name,
                "servings":              r.servings,
                "calories_per_serving":  r.calories_per_serving,
                "protein_per_serving":   r.protein_per_serving,
                "carbs_per_serving":     r.carbs_per_serving,
                "fat_per_serving":       r.fat_per_serving,
                "fiber_per_serving":     r.fiber_per_serving,
                "iron_per_serving":      r.iron_per_serving,
                "isVegetarian":          str(r.is_vegetarian).lower(),
                "ingredients_count":     r.ingredients_count,
                "grams_per_serving":     r.grams_per_serving,
                "unmatched_ingredients": "; ".join(r.unmatched_ingredients),
                "approximated_ingredients": "; ".join(r.approximated_ingredients),
            })

    # ── Summary ──────────────────────────────────────────────────────────────
    print(f"\n{'─'*50}")
    print(f"Total recipes        : {len(rows)}")
    print(f"Successfully calc'd  : {success}")
    print(f"Failed (no match)    : {failed}")

    unique_unmatched = sorted(set(all_unmatched))
    print(f"Unique unmatched ing : {len(unique_unmatched)}")
    if unique_unmatched:
        print("Unmatched ingredients:")
        for u in unique_unmatched[:30]:
            print(f"  · {u}")
        if len(unique_unmatched) > 30:
            print(f"  ... and {len(unique_unmatched) - 30} more")

    print(f"\nOutput saved to: {OUTPUT_CSV}")
    print(f"\n{'─'*50}")
    print(f"{'Recipe':<35} {'Cal':>6} {'P':>6} {'C':>6} {'F':>6}")
    print(f"{'─'*35} {'─'*6} {'─'*6} {'─'*6} {'─'*6}")
    for r in results[:15]:
        print(f"{r.name:<35} {r.calories_per_serving:>6.0f} {r.protein_per_serving:>5.1f}g "
              f"{r.carbs_per_serving:>5.1f}g {r.fat_per_serving:>5.1f}g")
    if len(results) > 15:
        print(f"  ... and {len(results) - 15} more in {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
