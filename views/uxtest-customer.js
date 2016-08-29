function qS(selector) { return document.querySelector(selector); };

        // Zoom
        var zoom1 = new ch.Zoom(qS('#zoom-default'));

        // // Tabs
        var tabs = new ch.Tabs(qS(".myTabs"));

        // Carousel
        var carousel = new ch.Carousel(qS('.my-carousel'), {"pagination": false});


        // Trasition
        var transition = new ch.Transition(qS('#transition'));

        var transitionX = new ch.Transition({
            'waiting': 'Transition without trigger!'
        });

      
        // Messages
        var message = (function (message, value) {
        var messages = {
             'option': 'Choose an option.',
             'requiredCheck': 'Accept the Terms of Use.',
             'link': 'Fill in this information. <a href="#double">Chico UI</a>.'
         };

         return function (message, value) {
             var message = messages[message] || message;
             if(value){
                 return message.replace('{#num#}',value)
             }
             return message;
         }
        }());

        // Form
        var m = new ch.Modal();

        var form = new ch.Form(qS('.myForm'))
                 .on('success', function (event) {
                     event.preventDefault();
                     m.show('success');
                 })
                 .on('error', function (errors) {
                     console.log(errors);
                 });

        tiny.on(form._el, 'submit', function (event) {
            if (!form.hasError()) {
                event.preventDefault();
                console.log('Ademas hago otra cosa en el submit');
            }
        });

        tiny.on('a[href="#"]', 'click', function(e) {
            e.preventDefault();
        });