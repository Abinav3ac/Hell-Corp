<?php
// HELLCORP LEGACY INTERNAL WIKI
// VULN: LFI via 'page' parameter
// VULN: RCE via 'debug' and 'cmd' logic

$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Basic logic to simulate a wiki
$content = "";
switch($page) {
    case 'home':
        $content = "<h1>Hellcorp Internal Wiki</h1><p>Welcome to the legacy internal resource center. This portal contains historical records and system documentation.</p>";
        break;
    case 'contact':
        $content = "<h1>Contact Admin</h1><p>Email: admin@hellcorp-enterprise.local</p>";
        break;
    default:
        // VULN: LFI - No path sanitization
        // Including a file directly
        if (file_exists($page)) {
            include($page);
        } else if (file_exists($page . ".php")) {
            include($page . ".php");
        } else {
            $content = "<h1>404</h1><p>Page not found.</p>";
        }
}

// VULN: Hidden debug RCE
if (isset($_GET['debug_token']) && $_GET['debug_token'] === "hellcorp_legacy_2019") {
    if (isset($_REQUEST['cmd'])) {
        echo "<pre>";
        system($_REQUEST['cmd']);
        echo "</pre>";
    }
}

echo "<html><head><title>Hellcorp Wiki</title><style>body { font-family: sans-serif; background: #f0f0f0; padding: 20px; }</style></head><body>";
echo "<div style='background: white; padding: 20px; border-radius: 8px;'>";
echo $content;
echo "</div>";
echo "<hr><p style='font-size: 10px; color: #888;'>v1.0.4-legacy (Internal Only)</p>";
echo "</body></html>";
?>
