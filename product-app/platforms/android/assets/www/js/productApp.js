/* Web Storage methods */
var WebStorage = function(){};

WebStorage.prototype.sessionStorageSupported = function(){

	try{

		return 'sessionStorage' in window && window['sessionStorage'] !== null;

	} catch(error){

		return false;

	}
};

WebStorage.prototype.localStorageSupported = function(){

	try{

		return 'localStorage' in window && window['localStorage'] !== null;

	} catch(error){

		return false;

	}
};

WebStorage.prototype.sessionStorageCheck = function(){

	try{

		return window.sessionStorage.length >= 1;

	} catch(error){

		return false;

	}
};

$(document).on('pagecreate', '#home', function(){
	webStorage = new WebStorage();

	/* Verificando soporte para sessionStorage en el contenedor web */
	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if (webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#home` OK');

			/* Uso del API para traer la lista de los productos */
			$.get('http://192.168.0.2:7070/api/v1/product/list', function(data){

				$('#content-home-list-products').children().remove();

				for (var i = 0; i < data.length; i++) {
					$('#content-home-list-products').append('<li><a href="#" id="product-' + data[i].id + '">' + data[i].name + '</a></li>');
				}

				$('#content-home-list-products').listview().listview('refresh');

			}).fail(function(jqXHR, textStatus, error){

				console.log(jqXHR, textStatus, error);

			});

		} else {

			console.log('Cambiando de Pagina');

			$('body').pagecontainer('change', '#options');
		}

	} else {

		console.log('No soporta sessionStorage :(');
	}
});

$(document).on('pagecreate', '#options', function(){

	var webStorage = new WebStorage();

	if(webStorage.sessionStorageSupported()){

		if(webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#options` OK');

			$('body').pagecontainer('change', '#home');

		} else {

			$('#content-options').html('<a href="#login" class="ui-btn ui-corner-all">¡Ingresar!</a>' +
							   '<a href="#register" class="ui-btn ui-corner-all">¡Registrarme!</a>');
		}

	} else {

		console.log('No soporta sessionStorage :(');
	}
});

$(document).on('pagecreate', '#login', function(){

	var webStorage = new WebStorage();

	if(webStorage.sessionStorageSupported()){

		if (webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#login` OK');

			$('body').pagecontainer('change', '#home');

		} else {

			$('#button-access').bind('click', function(event){

				var email = $('#email-login').val();
				var password = $('#password-login').val();

				$.post('http://192.168.0.2:7070/api/v1/user/login', {"email":email, "password":password}, function(data){

			          if (Object.keys(data).indexOf("error") === 0) {

			            console.log(data.error);

			            var onAlert = function(){
			              $('#content-login-form').trigger('reset');
			            };

			            navigator.notification.alert('Usuarion y/o Contraseña invalidos', onAlert, '¡Error!', 'Aceptar');

			          } else {

				            window.sessionStorage.setItem('cookie', data.cookie);
				            window.localStorage.setItem('email', data.email);
							window.localStorage.setItem('firstname', data.firstname);
							window.localStorage.setItem('lastname', data.lastname);
							window.localStorage.setItem('password', data.password);
							window.localStorage.setItem('phone', data.phone);


				            $.get('http://192.168.0.2:7070/api/v1/product/list', function(data){

				              console.log(data.length);

				              $("#content-home-list-products").children().remove();

				              for (var i = 0; i < data.length; i++) {
				                $('#content-home-list-products').append('<li><a href="#" id="product-' + data[i].id + '">' + data[i].name + '</a><li>');
				              }

				              $('#content-home-list-products').listview().listview('refresh');

				              $('body').pagecontainer('change', '#home');

				            }).fail(function(jqXHR, textStatus, errorThrown){
				              // console.log(error.statusCode);
				              console.log(textStatus, errorThrown);
				           });
	          		    }


	        }).fail(function(error){
	          console.log(error);
	        });

	        event.preventDefault();

			});
		}

	} else {

		console.log('No soporta sessionStorage :(');
	}

});

$(document).on('pagecreate', '#register', function(){

	var webStorage = new WebStorage();

	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if(webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#register` OK');

		} else {

			$('#button-register').bind('click', function(event){

				var email = $('#email-register').val();
				var firstname = $('#firstname-register').val();
				var lastname = $('#lastname-register').val();
				var phone = $('#phone-register').val();
				var password = $('#password-register').val();

				$.post('http://192.168.0.2:7070/api/v1/user/create',

				{
					"email":email,
					"firstname":firstname,
					"lastname":lastname,
					"phone":phone,
					"password":password
				}
				 ,function(data){

				 	if(Object.keys(data).indexOf('error') === 0){

				 		var onAlert = function(){

				 			$('#content-register-form').trigger('reset');
				 		};

				 		navigator.notification.alert('Algo salio mal revisa el Formulario', onAlert, '¡Error!', 'Aceptar');

				 	} else {

				 		window.sessionStorage.setItem('cookie', data.cookie);
				 		window.localStorage.setItem('email', data.email);
						window.localStorage.setItem('firstname', data.firstname);
						window.localStorage.setItem('lastname', data.lastname);
						window.localStorage.setItem('password', data.password);
						window.localStorage.setItem('phone', data.phone);

						$('body').pagecontainer('change', '#home');
				 	}

				 }).fail(function(jqXHR, textStatus, error){

				 	console.log(textStatus, error);
				 });

				 event.preventDefault();

			});
		}

	} else {

		console.log('No soporta sessionStorage :(');

	}
});

$(document).on('pagecreate', '#forgot-password', function(){

	$('#button-forgot-password').bind('click', function(event){

		var onConfirm = function(buttonIndex){

			if (buttonIndex === 1){

				var email = $('#email-forgot-password').val();

				var password = $('#password-forgot-password').val();

				var firstname = window.localStorage.getItem('firstname');

				var lastname = window.localStorage.getItem('lastname');

				var phone = window.localStorage.getItem('phone');

				$.post('http://192.168.0.2:7070/api/v1/user/' + email + '/update', 
					{
						"password":password,
						"firstname":firstname,
						"lastname":lastname,
						"phone":phone

					},
					function(data){

						console.log(data);

						window.sessionStorage.setItem('cookie', data.cookie);
				 		window.localStorage.setItem('email', data.email);
						window.localStorage.setItem('firstname', data.firstname);
						window.localStorage.setItem('lastname', data.lastname);
						window.localStorage.setItem('password', data.password);
						window.localStorage.setItem('phone', data.phone);

						$('body').pagecontainer('change', '#home');

					}).fail(function(jqXHR, textStatus, error){

				 	console.log(textStatus, error);
				 });

			} else {

				$('#content-forgot-password-form').trigger('reset');
			}
		};

		navigator.notification.confirm('Desea Aceptar el cambio de Contraseña', onConfirm, 'Cambio Contraseña', ['Aceptar', 'Cancelar']);

	});

});
