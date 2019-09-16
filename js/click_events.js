jQuery(document).ready( function() {
    /*
        Click event for the "New Recipe" button
    */
    jQuery(".addRecipeButton").on("click", function(){
        var newRecipeView = new_recipe_form();
        jQuery('.displayDiv').html(newRecipeView);
    });
    /*
        Click event for add ingredients button in the new recipe form
    */
    let newIngredientInputNumber = 1;
    jQuery(".dinnerBuddyMainDiv").on("click", ".addNewIngredient", function(){
        var newIngredientInput = new_recipe_ing(newIngredientInputNumber);
        jQuery('.newIngredientsArea').append(newIngredientInput);
        newIngredientInputNumber++;
    });
    /*
        Click event for submitting a new recipe
    */
    // variable used to hold post id information
    let newRecipeMediaId = '';
    let newMediaId = '';
    jQuery(".dinnerBuddyMainDiv").on("click", ".saveRecipeButton", function(){
        event.preventDefault()
        //creates an object to hold ingredient data
        let ingredientsObject = {};
        //create an array from the ingredients list
        var ingredientsData = jQuery('.newIngredientInput');
        var ingredientsAmountData = jQuery('.newIngredientAmount');
        var count = ingredientsData.length;
        for( var i = 0; i < count; i++){
            var ingredientName = ingredientsData[i].value;
            var amount = ingredientsAmountData[i].value;
            var currentIngredient = 'ing' + i;
            var singleIngredientObject = {};
            singleIngredientObject[ingredientName] = amount
            ingredientsObject[currentIngredient] = singleIngredientObject;
        }
        // Create an object from the new recipe form data
        var newRecipeData = {
            title: jQuery('#newRecipeTitleInput').val(),
            content: jQuery('#newRecipeDescription').val(),
            servings: jQuery('#newRecipeServingsInput').val(),
            ingredients: ingredientsObject,
            instructions: jQuery('#newRecipeInstructions').val(),
            status: 'publish',
        };
        //select the featured image from the new recipes form
        let imageData = jQuery('#newRecipeImage')[0].files[0];
        //console.log(imageData);
        let fd = new FormData();
        fd.append( 'file', imageData);
        fd.append( 'caption', 'test media GO!' );
        //console.log wont work for FormData()
        // for (var pair of fd.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]);
        // }
        var url = window.location.origin + '/wp-json/wp/v2/recipes';
        jQuery.ajax( {
            url: url,
            method: 'POST',
            beforeSend: function(xhr) {
				xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
			},
            data : newRecipeData
        }).done(function(responseData) {
            newRecipeMediaId = responseData.id;
        }).complete(function (completeData, status){
            fd.append( 'post', newRecipeMediaId);
            // for (var pair of fd.entries()) {
            //     console.log(pair[0]+ ', ' + pair[1]);
            // }
            var mediaUrl = window.location.origin + '/wp-json/wp/v2/media';
            jQuery.ajax({
                beforeSend: function(xhr) {
     				xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
     			},
                processData: false,
    			contentType: false,
                method: 'POST',
                data: fd,
                url: mediaUrl
            }).done( function(data){
                newMediaId = data.id;
            }).complete(function (completeData, status){
                var featureData = {
                    'featured_media' : newMediaId
                };
                var featureUrl = window.location.origin + '/wp-json/wp/v2/recipes/' + newRecipeMediaId;
                jQuery.ajax({
                    beforeSend: function(xhr) {
         				xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
         			},
                    method: 'PUT',
                    data: featureData,
                    url: featureUrl,
                }).done( function() {
                });// end 3rd ajax call that assigns the featured image to the post
            });// end featured image ajax request
        });// end ajax.complete for post request
    });// end save new recipe click event

    /*
        Click event for Browse Recipes
    */
    jQuery(".dashboard").on("click", ".browseRecipeButton", function(){
        event.preventDefault();
        // Get recent recipe data for the 'browse recipes' view
        var browseRecipesUrl = window.location.origin + '/wp-json/wp/v2/recipes?_embed';
        jQuery.ajax({
            beforeSend: function(xhr) {
                xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
            },
            method: 'GET',
            url: browseRecipesUrl
        }).done( function(data){
            var browseRecipesView = browse_recipes_view(data);
            jQuery('.displayDiv').html(browseRecipesView);
        });
    });// end browse recipes click event

    /*
        Click event for Search Recipes
    */
    jQuery(".dashboard").on("click", ".searchRecipeButton", function(){
        event.preventDefault();
        // Get search term from the search text input
        var searchTerm = jQuery('.searchInput').val();
        // Get recent recipe data for the 'search recipes' view
        var searchRecipesUrl = window.location.origin + '/wp-json/wp/v2/recipes?search=' + searchTerm;
        console.log(searchRecipesUrl);
        jQuery.ajax({
            beforeSend: function(xhr) {
                xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
            },
            method: 'GET',
            url: searchRecipesUrl
        }).done( function(data){
            // Create a main div for displaying the information
            let searchViewDiv = '<div id="searchViewDiv">';
            searchViewDiv += '</div>';
            jQuery('.displayDiv').html(searchViewDiv );
            // Make an api call for each of the array elements
            // Is there a better way?
            data.forEach( function(value, index, array) {
                var searchPostUrl = window.location.origin + '/wp-json/wp/v2/recipes/' + value.id+'?_embed';
                jQuery.ajax({
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
                    },
                    method: 'GET',
                    url: searchPostUrl,
                }).done( function(searchResult) {
                    //console.log(searchResult);
                    var searchViewCard = search_recipes_view(searchResult);
                    jQuery('#searchViewDiv').append(searchViewCard);
                });

            })
        });
    });// end search recipes click event

    /*
        Click event for the Calendar button
    */
    jQuery(".dashboard").on("click", ".calendarButton", function(){
        event.preventDefault();
        var calendarView = calendar_view();
        jQuery('.displayDiv').html(calendarView);
        jQuery( '.droppable' ).droppable({
            // This function defines what happends when a recipe is dropped on the calendar
            drop: function( event, ui) {
                drop_function(event, ui);
            }
        });
    });// end calendar click event

    /*
        Click event for the add button. Creates a recipe in the dock
    */
    jQuery(".dinnerBuddyMainDiv").on("click", ".selectRecipe", function(){
        event.preventDefault();
        // Get the post id from the button
        var postId = this.id;
        var recipeCardUrl = window.location.origin + '/wp-json/wp/v2/recipes/'+postId;
        jQuery.ajax({
            beforeSend: function(xhr) {
                xhr.setRequestHeader( 'X-WP-Nonce' , WPsettings.nonce);
            },
            method: 'GET',
            url: recipeCardUrl
        }).done( function(data){
            //console.log(data);
            var recipeCard = create_recipe_card(data);
            jQuery('#recipeDock').append(recipeCard);
            // uses jquery UI  to make the recipe cards draggable
            jQuery('.draggable').draggable({revert: true, helper: "clone"});
        });
    });// end calendar click event

    /*
        Click event for the add button. Creates a recipe in the dock
    */
    jQuery("#recipeDock").on("click", ".recipeCardX", function() {
        console.log(this.value);
        jQuery('#card'+this.value).remove();
    });
});// end document.ready
