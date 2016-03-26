Template.leapTest.onRendered(function () {
    Utils.waitForScene(function () {
        var controller = LeapUtils.createController();
        controller.use("rotateAndZoom", { container: $("a-box").get(0) });
    });

    $("a-box").click(function () {
        $("a-box").get(0).setAttribute("material", "color", getRandomColor());
    })
});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}