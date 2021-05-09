package com.gmail.boiledorange73.app.morsetrainer

import android.os.Handler
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import java.io.File
import java.io.FileReader


class WebAppInterface {
    private val mActivity: MainActivity
    private val mHandler: Handler
    constructor(activity: MainActivity) {
        this.mActivity = activity
        this.mHandler = Handler()
    }
    @JavascriptInterface
    fun requestScenarioList(filename: String):Boolean {
        val f: File? = mActivity.getExternalFilesDir(null)
        val path:String? = if(f != null) f.absolutePath + File.separator + filename else null
        var str_json:String ? = null
        if( path != null ) {
            try {
                val reader = FileReader(path)
                val str_raw = reader.readText()
                val obj = JSONArray(str_raw)
                str_json = obj.toString()
            }
            catch (e: Exception) {
                e.printStackTrace()
            }
        }
        val webView = mActivity.findViewById<WebView>(R.id.web)
        mHandler.post(
            Runnable {
                webView.loadUrl("javascript:onScenarioListGot(" + (if (str_json != null) str_json else "null") + ")")
            }
        )
        return str_json != null
    }
    @JavascriptInterface
    fun acquireWake() {
        this.mActivity.acquireWake()
    }

    @JavascriptInterface
    fun releaseWake() {
        this.mActivity.releaseWake()
    }
}