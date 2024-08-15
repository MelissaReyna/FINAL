$(document).ready(function () {
    // Function to add a new food item input set to the specified meal section
    function addFoodItem(meal) {
        const foodItemHtml = `
            <div class="food-item">
                <input type="text" class="form-control food-name" placeholder="Food item">
                <input type="number" class="form-control food-quantity" placeholder="Quantity" value="1">
                <button type="button" class="btn btn-danger btn-sm remove-food">-</button>
            </div>
        `;
        $(`#${meal} .food-items`).append(foodItemHtml);
    }

    // Function to calculate total calories for the specified meal section
    function calculateTotalCalories(meal) {
        let totalCalories = 0;
        const foodItems = $(`#${meal} .food-item`);
        let remainingItems = foodItems.length;

        // Iterate over each food item to fetch calorie data
        foodItems.each(function () {
            const foodName = $(this).find('.food-name').val();
            const foodQuantity = $(this).find('.food-quantity').val();

            // Check if both food name and quantity are provided
            if (foodName && foodQuantity) {
                $.ajax({
                    url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
                    method: 'POST',
                    headers: {
                       'x-app-id': '52a3b545',
                        'x-app-key': 'a803b7254c5f8da106a2f7c4a99b371f'
                    },
                    data: JSON.stringify({ query: `${foodQuantity} ${foodName}` }),
                    contentType: 'application/json',
                    success: function (data) {
                        // Update total calories if food data is returned
                        if (data.foods && data.foods.length > 0) {
                            const food = data.foods[0];
                            totalCalories += food.nf_calories;
                        }
                        remainingItems--;
                        // Update the total calories display after all items are processed
                        if (remainingItems === 0) {
                            $(`#${meal} .total-calories span`).text(totalCalories);
                        }
                    },
                    error: function (error) {
                        console.error('API error:', error);
                        remainingItems--;
                        // Update the total calories display even if there's an error
                        if (remainingItems === 0) {
                            $(`#${meal} .total-calories span`).text(totalCalories);
                        }
                    }
                });
            } else {
                remainingItems--;
                // Update the total calories display if some items are incomplete
                if (remainingItems === 0) {
                    $(`#${meal} .total-calories span`).text(totalCalories);
                }
            }
        });
    }

    // Initialize the meal sections with event handlers and a default food item
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        // Add food item when the add button is clicked
        $(`#${meal} .add-food .btn`).on('click', function () {
            addFoodItem(meal);
        });

        // Remove food item and recalculate calories when the remove button is clicked
        $(`#${meal}`).on('click', '.remove-food', function () {
            $(this).closest('.food-item').remove();
            calculateTotalCalories(meal);
        });

        // Recalculate calories when the food name or quantity inputs are changed
        $(`#${meal}`).on('input', '.food-name, .food-quantity', function () {
            calculateTotalCalories(meal);
        });

        // Add an initial food item to each meal section
        addFoodItem(meal);
    });
});
