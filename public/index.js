$(document).ready(() => {

    var idContent = ''

    function noIdMatch() {
        $('#error-message').css('background-color', '#FF7B00')
        $('#error-message').text("No ID match").show().addClass('shake')
        setTimeout(() => {
            $('#error-message').slideUp().removeClass('shake')
        }, 4500);
    }

    function idMatch() {
        $('#error-message').css('background-color', 'green')
        $('#error-message').text("Match for " + idContent + " ID found").removeClass('shake').slideDown()
        setTimeout(() => {
            $('#error-message').slideUp()
        }, 3000);
    }

    function idInvalid() {
        $('#error-message').css('background-color', 'red')
        $('#error-message').text("Invalid member ID").slideDown()
        setTimeout(() => {
            $('#error-message').slideUp();
        }, 3000)
    }

    $('#member-id').on('input', function () {
        const id = $(this).val()
        if (id.length === 6) {

            $.ajax({
                type: 'GET',
                url: '/search',
                data: {query: id},
                success: function(data) {
                // Process the search results and update the UI

                    if (typeof(data) === "object") {
                        idContent = data.id
                        idMatch()
                    } else if (typeof(data) === "string") {
                        noIdMatch()
                        $('.form').submit(function (e) {
                            e.preventDefault();
                            noIdMatch();
                        });
                    }
                },
                error: function(xhr, status, error) {
                console.error(error);
                }
            });
        }
    });

    $('.form').submit((e) => {
        if ($('#member-id').val().length < 6) {
            e.preventDefault();
            idInvalid();
            // alert("Not 6 digits")
        }
    })

})
