package com.fitiq.app;

import android.Manifest;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "StepCounter",
    permissions = {
        @Permission(
            alias = "activityRecognition",
            strings = { Manifest.permission.ACTIVITY_RECOGNITION }
        )
    }
)
public class StepCounterPlugin extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor stepSensor;
    private PluginCall pendingCall;

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", stepSensor != null);
        call.resolve(ret);
    }

    // Returns total steps counted by the hardware sensor since last device reboot.
    // The JS layer subtracts the day-start baseline to get today's steps.
    @PluginMethod
    public void getSteps(PluginCall call) {
        if (stepSensor == null) {
            JSObject ret = new JSObject();
            ret.put("steps", 0);
            ret.put("available", false);
            call.resolve(ret);
            return;
        }
        // Android 10+ requires runtime ACTIVITY_RECOGNITION permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
                !getPermissionState("activityRecognition").toString().equals("granted")) {
            requestPermissionForAlias("activityRecognition", call, "activityRecognitionResult");
            return;
        }
        readSteps(call);
    }

    @PermissionCallback
    private void activityRecognitionResult(PluginCall call) {
        if (getPermissionState("activityRecognition").toString().equals("granted")) {
            readSteps(call);
        } else {
            JSObject ret = new JSObject();
            ret.put("steps", 0);
            ret.put("available", false);
            call.resolve(ret);
        }
    }

    private void readSteps(PluginCall call) {
        call.setKeepAlive(true);
        pendingCall = call;
        sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_NORMAL);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER && pendingCall != null) {
            sensorManager.unregisterListener(this);
            JSObject ret = new JSObject();
            ret.put("steps", (long) event.values[0]);
            ret.put("available", true);
            pendingCall.resolve(ret);
            pendingCall = null;
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
