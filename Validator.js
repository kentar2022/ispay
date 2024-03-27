document.addEventListener("DOMContentLoaded", function() {
    var textInput = document.getElementById("textInput");
    var submitButton = document.getElementById("submitButton");

    submitButton.addEventListener("click", function() {
        var id = textInput.value.trim();

        if (id === "") {
            alert("Введите ID!");
            return;
        }

        
        fetch('validate_id.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                alert("ID найден в данных!");
            } else {
                alert("ID не найден в данных.");
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
    });
});
