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
        var sJson:String ? = null
        if( path != null ) {
            try {
                val reader = FileReader(path)
                val sRaw = reader.readText()
                val obj = JSONArray(sRaw)
                sJson = obj.toString()
            }
            catch (e: Exception) {
                e.printStackTrace()
            }
        }
        val webView = mActivity.findViewById<WebView>(R.id.web)
        mHandler.post({
            webView.loadUrl("javascript:onScenarioListGot(" + (if (sJson != null) sJson else "null") + ")")
        })
        return sJson != null
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