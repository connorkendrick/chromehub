function display(ele) {
    if (event.key === 'Enter' && ele.value != '') {
        var message = "Hello, " + ele.value + ".";
        document.getElementById('welcome-message').innerHTML = message;
        document.getElementById('welcome-message').style.display = 'inline';

        hide(document.getElementById('initial-landing-message'));
        show(document.getElementById('welcome-message'));
    }
}

function hide(ele) {
    ele.style.display = 'none';
}

function show(ele) {
    ele.style.display = 'block';
}
