const rootStyles = window.getComputedStyle(document.documentElement); //this recovers all the styles inside :root

// This check is to make sure that getPropertyValue is ready to read
if (rootStyles.getPropertyValue('--book-cover-width-large') != null && 
    rootStyles.getPropertyValue('--book-cover-width-large') != '') {
    ready();
} else {
    document.getElementById('main-css').addEventListener('load', ready);
} 


function ready() {
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    const coverHeight = coverWidth / coverAspectRatio;
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode,
    );

    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    });

    FilePond.parse(document.body);
}