/*
    Initiates the api call class
*/
class APICall {
    constructor(method, url) {
        // /this.data = data;
        this.method = method;
        this.url = url;
    }

    createRecipeCard() {
        var cardData = jQuery.ajax({
            beforeSend: function(xhr) {
                xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
            },
            method: this.method,
            url: this.url
        })
        return cardData;
    }
}
