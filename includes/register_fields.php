<?php
/*
    Register custom post fields and their callback functions
*/

// exit if file is called directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

//add custom fields meta data to a recipe post
function get_recipe_data() {
    //add custom field for recipe servings
    register_rest_field(
        'recipes' ,
        'servings',
        array(
            'get_callback'    => function($callbackData, $postData) {
				return get_post_meta($callbackData['id'], 'servings', false);
				},
            'update_callback' => function($callbackData, $postData) {
                update_post_meta($postData->ID, 'servings', $callbackData);
                return;
                },
            'schema' => null,
        )
    );
    // add custom field for instructions
    register_rest_field(
        'recipes' ,
        'instructions',
        array(
			'get_callback'    => function($callbackData, $postData) {
				return get_post_meta($callbackData['id'], 'instructions', false);
				},
				'update_callback' => function($callbackData, $postData) {
                update_post_meta($postData->ID, 'instructions', $callbackData);
                return;
				},
            'schema' => null,
        )
    );
    // add custom fields for ingredients
    register_rest_field(
        'recipes' ,
        'ingredients',
        array(
			'get_callback'    => function($callbackData, $postData) {
				return get_post_meta($callbackData['id'], 'ingredients', false);
				},
            'update_callback' => function($callbackData, $postData) {
                $values = json_encode($callbackData);
                update_post_meta($postData->ID, 'ingredients', $values);
                return;
                },
            'schema' => null,
        )
    );
    // add custom fields for image input
    // register_rest_field(
    //     'recipes' ,
    //     'image',
    //     array(
	// 		'get_callback'    => function($callbackData, $postData) {
	// 			return get_post_meta($callbackData['id'], 'ingredients', false);
	// 			},
    //         'update_callback' => function($callbackData, $postData) {
    //             update_post_meta($postData->ID, 'image', $callbackData);
    //             return;
    //             },
    //         'schema' => null,
    //     )
    // );
}
add_action( 'rest_api_init', 'get_recipe_data' );

function slug_get_recipe($callbackData, $postData) {
	//print_r($postData);
    //return get_post_meta($callbackData['id']);
    // return get_post_meta($postData->ID);
}


?>
