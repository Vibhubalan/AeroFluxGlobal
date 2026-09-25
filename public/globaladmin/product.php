<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../lib/product-save.php';
desk_require();

$pdo = aero_pdo();
$recordId = (int) ($_GET['id'] ?? $_POST['record_id'] ?? 0);
$row = [
    'id' => 0, 'category_slug' => (string) ($_GET['category'] ?? 'piston-engine-oil'), 'item_id' => '', 'name' => '',
    'packs' => [''], 'description' => '', 'applications' => '', 'specifications' => [''],
    'summary' => '', 'featured' => 0,
];
if ($pdo instanceof PDO && $recordId > 0 && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    $statement = $pdo->prepare('SELECT * FROM catalog_items WHERE id = ?');
    $statement->execute([$recordId]);
    $found = $statement->fetch();
    if (is_array($found)) {
        $row = $found;
        $row['packs'] = aero_json_list($found['packs']);
        $row['specifications'] = aero_json_list($found['specifications']);
    }
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$pdo instanceof PDO) {
        $error = 'Database is not connected.';
    } else {
        try {
            $error = aero_save_product($pdo);
            if ($error === '') {
                header('Location: ' . desk_url('products.php'));
                exit;
            }
        } catch (Throwable $failure) {
            $error = 'Could not save that item. Use a unique name inside the category.';
        }
    }
    $row['category_slug'] = (string) ($_POST['category_slug'] ?? '');
    $row['item_id'] = (string) ($_POST['item_id'] ?? '');
    $row['name'] = (string) ($_POST['name'] ?? '');
    $row['packs'] = aero_lines('packs') ?: [''];
    $row['description'] = (string) ($_POST['description'] ?? '');
    $row['applications'] = (string) ($_POST['applications'] ?? '');
    $row['specifications'] = aero_lines('specifications') ?: [''];
    $row['summary'] = (string) ($_POST['summary'] ?? '');
    $row['featured'] = isset($_POST['featured']) ? 1 : 0;
    $row['id'] = $recordId;
}

$packs = $row['packs'] !== [] ? $row['packs'] : [''];
$specs = $row['specifications'] !== [] ? $row['specifications'] : [''];
$body = '<div class="narrow"><p><a href="' . desk_url('products.php') . '">All products</a></p><h1>' . ($recordId > 0 ? 'Edit item' : 'Add item') . '</h1>';
if ($error !== '') {
    $body .= '<p>' . aero_h($error) . '</p>';
}
$body .= '<form method="post" enctype="multipart/form-data">';
$body .= '<input type="hidden" name="record_id" value="' . (int) $row['id'] . '">';
$body .= '<label>Category</label><select name="category_slug">';
foreach (aero_categories() as $slug => $title) {
    $selected = $slug === $row['category_slug'] ? ' selected' : '';
    $body .= '<option value="' . aero_h($slug) . '"' . $selected . '>' . aero_h($title) . '</option>';
}
$body .= '</select><label>Name</label><input name="name" required value="' . aero_h((string) $row['name']) . '">';
$body .= '<label>ID</label><input name="item_id" value="' . aero_h((string) $row['item_id']) . '" placeholder="Filled from the name if left blank">';
$body .= '<label>Image</label><input type="file" name="image" accept=".jpg,.jpeg,.png,.webp">';
$body .= '<label>Pack sizes</label><div id="packs">';
foreach ($packs as $pack) {
    $body .= '<div class="row"><input name="packs[]" value="' . aero_h((string) $pack) . '" placeholder="6x1 USQ"></div>';
}
$body .= '</div><p><button class="ghost" type="button" id="add-pack">Add pack size</button></p>';
$body .= '<label>Description</label><textarea name="description" rows="4">' . aero_h((string) $row['description']) . '</textarea>';
$body .= '<label>Applications</label><textarea name="applications" rows="3">' . aero_h((string) $row['applications']) . '</textarea>';
$body .= '<label>Specifications</label><div id="specs">';
foreach ($specs as $spec) {
    $body .= '<div class="row"><input name="specifications[]" value="' . aero_h((string) $spec) . '" placeholder="MIL-PRF-7870"></div>';
}
$body .= '</div><p><button class="ghost" type="button" id="add-spec">Add bullet</button></p>';
$body .= '<label>Short summary</label><input name="summary" value="' . aero_h((string) $row['summary']) . '">';
$body .= '<label><input type="checkbox" name="featured" style="width:auto"' . ((int) $row['featured'] === 1 ? ' checked' : '') . '> Featured</label>';
$body .= '<p><button type="submit">Save item</button></p></form></div>';
$body .= '<script>
  function addRow(id, name, placeholder) {
    const row = document.createElement("div");
    row.className = "row";
    const input = document.createElement("input");
    input.name = name;
    input.placeholder = placeholder;
    row.appendChild(input);
    document.getElementById(id).appendChild(row);
  }
  document.getElementById("add-pack").onclick = () => addRow("packs", "packs[]", "6x1 USQ");
  document.getElementById("add-spec").onclick = () => addRow("specs", "specifications[]", "MIL-PRF-7870");
</script>';
desk_layout($recordId > 0 ? 'Edit item' : 'Add item', $body);
