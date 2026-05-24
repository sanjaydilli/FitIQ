package com.fitiq.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void registerPlugins() {
        super.registerPlugins();
        registerPlugin(StepCounterPlugin.class);
    }
}
