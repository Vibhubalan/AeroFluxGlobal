<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/catalog.php';
require_once __DIR__ . '/lib/chrome.php';

$category = isset($_GET['c']) ? (string) $_GET['c'] : '';
$id = isset($_GET['id']) ? (string) $_GET['id'] : '';
$categories = aero_categories();
$item = ($category !== '' && $id !== '') ? aero_find_item($category, $id) : null;

if ($item === null || !isset($categories[$category])) {
    http_response_code(404);
    aero_page_start('Not found');
    echo '<p>This product is not listed.</p><a class="btn" href="/portfolio">Back to products</a>';
    aero_page_end();
    exit;
}

aero_page_start($item['name'] . ' · AeroFlux Global');
echo '<p class="crumb"><a href="/portfolio">Products</a> / <a href="/' . aero_h($category) . '">' . aero_h($categories[$category]) . '</a></p>';
echo '<div class="grid" style="margin-top:2rem">';
echo '<div class="shot"><img src="' . aero_h($item['image']) . '" alt=""></div><div>';
echo '<h1>' . aero_h($item['name']) . '</h1>';
echo '<label style="display:block;max-width:20rem;margin-top:2rem"><span>Pack Size</span><select>';
foreach ($item['packs'] as $pack) {
    echo '<option>' . aero_h($pack) . '</option>';
}
echo '</select></label>';
echo '<p>' . aero_h($item['description']) . '</p>';
echo '<h2>Applications</h2><p>' . aero_h($item['applications']) . '</p>';
echo '<h2>Specifications</h2><ul>';
foreach ($item['specifications'] as $spec) {
    echo '<li>' . aero_h($spec) . '</li>';
}
echo '</ul><a class="btn" href="/contact">Contact Us</a></div></div>';
aero_page_end();
