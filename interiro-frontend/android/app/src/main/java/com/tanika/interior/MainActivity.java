package com.tanika.interior;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // super.onCreate initialises the Capacitor Bridge and WebView
        super.onCreate(savedInstanceState);

        // After the bridge is ready, replace the WebViewClient with a subclass
        // that forwards intent:// URLs to Android's activity manager.
        // This lets model-viewer fire the Scene Viewer (ARCore) intent.
        getBridge().getWebView().setWebViewClient(new BridgeWebViewClient(getBridge()) {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();

                if ("intent".equals(uri.getScheme())) {
                    try {
                        Intent intent = Intent.parseUri(
                            uri.toString(),
                            Intent.URI_INTENT_SCHEME
                        );
                        startActivity(intent);
                    } catch (ActivityNotFoundException e) {
                        // Scene Viewer not installed — open fallback URL in browser
                        String fallback = uri.getQueryParameter("S.browser_fallback_url");
                        if (fallback != null) {
                            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(fallback)));
                        }
                    } catch (Exception ignored) {}
                    return true;
                }

                // All other URLs handled by Capacitor as normal
                return super.shouldOverrideUrlLoading(view, request);
            }
        });
    }
}
