var input = document.getElementById("user-input");
input.addEventListener("keydown", function(event) {
    if (event.keyCode === 13 && input.value != '') {
        var welcomeMessage = document.getElementById('welcome-message');
        var initialLandingMessage = document.getElementById('initial-landing-message');

        welcomeMessage.innerHTML = "Hello, " + input.value + ".";
        welcomeMessage.style.display = 'inline';

        hide(initialLandingMessage);
        show(welcomeMessage);
    }
});

function hide(ele) {
    ele.style.display = 'none';
}

function show(ele) {
    ele.style.display = 'block';
}
