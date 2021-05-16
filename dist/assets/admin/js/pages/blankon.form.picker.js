var BlankonFormPicker = function () {

    return {

        // =========================================================================
        // CONSTRUCTOR APP
        // =========================================================================
        init: function () {
            BlankonFormPicker.bootstrapDatepicker();
            BlankonFormPicker.bootstrapColorpicker();
        },

        // =========================================================================
        // BOOTSTRAP DATEPICKER
        // =========================================================================
        bootstrapDatepicker: function () {
            if($('#dp').length){

                // Default datepicker (options)
                $('#dp1').datepicker({
                    format: 'mm-dd-yyyy',
                    todayBtn: 'linked'
                });

                // Default datepicker (data tag)
                $('#dp2').datepicker();
                $('#btn2').click(function(e){
                    e.stopPropagation();
                    $('#dp2').datepicker('update', '03/17/12');
                });

                //Inline mode
                $('#dp3').datepicker({
                    todayBtn: 'linked'
                });

                $('#btn3').click(function(){
                    $('#dp3').datepicker('update', '15-05-1984');
                });
            }
        },

        // =========================================================================
        // BOOTSTRAP COLORPICKER
        // =========================================================================
        bootstrapColorpicker: function () {

            // Trigger colorpicker global
            $('.color-picker').colorpicker();

            // Transparent color support
            $('.color-picker-transparent').colorpicker(
                {
                    format: 'rgba' // force this format
                }
            );

            // Horizonal mode
            $('.color-picker-horizontal').colorpicker({
                format: 'rgba', // force this format
                horizontal: true
            });

            // Bootstrap colors
            $('.color-picker-bootstrap').colorpicker({
                colorSelectors: {
                    'default': '#777777',
                    'primary': '#337ab7',
                    'success': '#5cb85c',
                    'info': '#5bc0de',
                    'warning': '#f0ad4e',
                    'danger': '#d9534f'
                }
            });

            // Custom widget size
            $('.color-picker-size').colorpicker({
                customClass: 'colorpicker-2x',
                sliders: {
                    saturation: {
                        maxLeft: 200,
                        maxTop: 200
                    },
                    hue: {
                        maxTop: 200
                    },
                    alpha: {
                        maxTop: 200
                    }
                }
            });

            // Using events
            var bodyStyle = $('.body-content')[0].style;
            $('.colorpicker-event').colorpicker({
                color: bodyStyle.backgroundColor
            }).on('changeColor', function(ev) {
                bodyStyle.backgroundColor = ev.color.toHex();
            });
        }

    };

}();

// Call main app init
BlankonFormPicker.init();