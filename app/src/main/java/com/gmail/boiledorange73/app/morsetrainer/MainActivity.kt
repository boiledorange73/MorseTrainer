package com.gmail.boiledorange73.app.morsetrainer

import android.content.Context
import android.content.DialogInterface
import android.content.pm.ApplicationInfo
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.PowerManager
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat


class MainActivity : AppCompatActivity() {
    var mHandler:Handler? = null
    var mWakeLock:PowerManager.WakeLock? = null
    var mAcquireWake:Boolean = false

    override fun onDestroy() {
        mHandler = null
        releaseWake()
        mWakeLock = null
        //
        val webview = findViewById<WebView>(R.id.web)
        webview.loadUrl("(function() { window.dispatchEvent(\"unload\"); })();")
        webview.stopLoading()
        webview.setWebChromeClient(null)
        webview.setWebViewClient(null)
        webview.destroy()
        //
        super.onDestroy()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) {
                WebView.setWebContentsDebuggingEnabled(true)
            }
        }

        val pm:PowerManager = this.getSystemService(Context.POWER_SERVICE) as PowerManager
        mWakeLock = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, "morse:wakelock")
        mAcquireWake = false


        mHandler = Handler()
        supportActionBar!!.hide()
        mHandler?.post({ this@MainActivity.setup() })
    }
    // Environment.getExternalStorageDirectory().getAbsolutePath();
    fun setup() {
        val webview = findViewById<WebView>(R.id.web)
        // webview settings
        val webViewSettings = webview.settings
        webViewSettings.allowFileAccess = true
        // Enable local storage (for Android 4.0.3)
        webViewSettings.javaScriptEnabled = true
        webViewSettings.domStorageEnabled = true
        webViewSettings.allowFileAccessFromFileURLs = true
        // accepts alert
        webview.webChromeClient = object: WebChromeClient() {
            // alert() is called.
            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
                        .setTitle(R.string.app_name)
                        .setPositiveButton(
                            android.R.string.ok,
                            { dialog, which -> result?.confirm() }
                        )
                        .setMessage(message)
                        .show()
                // Do not call super.onJsAlert()
                return true
            }
        }
        //
        webview.addJavascriptInterface(WebAppInterface(this), "Android")
        //
        webview.loadUrl("file:///android_asset/index.html")
    }

    fun acquireWake() {
        if( !mAcquireWake ) {
            mWakeLock?.acquire()
            mAcquireWake = true
        }
    }

    fun releaseWake() {
        if( mAcquireWake ) {
            mWakeLock?.release()
            mAcquireWake = false
        }
    }
}