<?php
session_start();

// Flag de mantenimiento
$maintenance_mode = false; // Cambia a false para desactivar

if ($maintenance_mode) {
    include 'mantenimiento.html';
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">

<head> 
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!-- Primary Meta Tags -->
<title>WEC - IA</title>
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<meta name="title" content="WEC - IA">
<meta name="author" content="CORSEC-TECH">
<meta name="description" content="IA que genera ideas, impulsa decisiones y transforma tu negocio.">
<meta name="keywords" content="IA generativa empresarial, automatización inteligente, decisiones basadas en datos, productividad aumentada, eficiencia operativa, innovación acelerada, escalabilidad segura" />
<link rel="canonical" href="https://corsec.tech/wecIA2">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://corsec.tech/wecIA2">
<meta property="og:title" content="WEC - IA">
<meta property="og:description" content="IA que genera ideas, impulsa decisiones y transforma tu negocio..">
<meta property="og:image" content="assets/img/proCorsec.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://corsec.tech/wecIA2">
<meta property="twitter:title" content="WEC - IA">
<meta property="twitter:description" content="IA que genera ideas, impulsa decisiones y transforma tu negocio..">
<meta property="twitter:image" content="assets/img/proCorsec.jpg">

<!-- Favicon -->
<link rel="apple-touch-icon" sizes="120x120" href="assets/img/favicon/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/img/favicon/favicon-16x16.png">
<link rel="manifest" href="assets/img/favicon/site.webmanifest">
<link rel="mask-icon" href="assets/img/favicon/safari-pinned-tab.svg" color="#ffffff">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">

<!-- Sweet Alert -->
<link type="text/css" href="vendor/sweetalert2/dist/sweetalert2.min.css" rel="stylesheet">

<!-- Notyf -->
<link type="text/css" href="vendor/notyf/notyf.min.css" rel="stylesheet">

<!-- Volt CSS -->
<link type="text/css" href="css/volt.css?v=1.0.15" rel="stylesheet">
<link rel="stylesheet" href="css/hover.css">
<link rel="stylesheet" href="css/style.css?v=1.0.15">

<!-- Core -->
<script src="vendor/bootstrap/dist/js/popper.min.js"></script>
<script src="vendor/bootstrap/dist/js/bootstrap.min.js"></script>

<!-- vue js -->
<script src="assets/js/vue.js?v=1.0.15"></script>
<script src="assets/js/vue-router.js?v=1.0.15"></script>
<script src="assets/js/vuex.js?v=1.0.15"></script>

</head>

<body>

    <main>
    
        <div id="app">
            <router-view></router-view>
        </div>
    
    </main>



<!-- Vendor JS -->
<script src="vendor/onscreen/dist/on-screen.umd.min.js"></script>
<script src="vendor/nouislider/dist/nouislider.min.js"></script>
<script src="vendor/smooth-scroll/dist/smooth-scroll.polyfills.min.js"></script>
<script src="vendor/chartist/dist/chartist.min.js"></script>
<script src="vendor/chartist-plugin-tooltips/dist/chartist-plugin-tooltip.min.js"></script>
<script src="vendor/vanillajs-datepicker/dist/js/datepicker.min.js"></script>
<script src="vendor/sweetalert2/dist/sweetalert2.all.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js"></script>
<script src="vendor/vanillajs-datepicker/dist/js/datepicker.min.js"></script>
<script src="vendor/notyf/notyf.min.js"></script>
<script src="vendor/simplebar/dist/simplebar.min.js"></script>
<script src="assets/js/volt.js"></script>
<script src="assets/js/three.min.js"></script>
<script src="assets/js/vanta.waves.min.js"></script>

<!-- backend -->
<script src="assets/js/axios.min.js"></script>

<!-- Librerías de exportación -->
 <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<!-- Componentes de la app -->
<script src="components/permissions.js?v=1.0.15"></script>
<script src="assets/js/main.js?v=1.0.15"></script>
<script src="components/baseLayout.js?v=1.0.15"></script>
<script src="components/Inicio.js?v=1.0.15"></script>

<script>
    app.use(router)
    app.mount("#app")        
</script>
    
</body>

</html>
