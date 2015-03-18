'use strict';
/* Web Storage methods */
var WebStorage = function(){};

var Info = function(){};

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


Info.prototype.getProductDetail = function(product_id){

	$.get('http://192.168.0.3:7070/api/v1/product/'+ product_id +'/find', function(data){

			window.localStorage.setItem('name', data.name);
			window.localStorage.setItem('type', data.type);
			window.localStorage.setItem('quantity', data.quantity);
			window.localStorage.setItem('amount', data.amount);
			window.localStorage.setItem('product_id', data.id);

			$('#name-product-detail').val(window.localStorage.getItem('name'));
			$('#type-product-detail').val(window.localStorage.getItem('type'));
			$('#quantity-product-detail').val(window.localStorage.getItem('quantity'));
			$('#amount-product-detail').val(window.localStorage.getItem('amount'));

			$('body').pagecontainer('change', '#product-detail');

	}).fail(function(jqXHR, textStatus, error){

		console.log(jqXHR, textStatus, error);

	});
};

Info.prototype.getProductList = function(){

	var self = this;
	/* Uso del API para traer la lista de los productos */
	$.get('http://192.168.0.3:7070/api/v1/product/list', function(data){

		$('#content-home-list-products').empty();

		for (var i = 0; i < data.length; i++) {
			$('#content-home-list-products').append('<li><a href="#" class="product-detail-page" data-product-id="' + data[i].id + '">' + data[i].name + '</a></li>');
		}

		$('#content-home-list-products').listview('refresh');

		$.mobile.document.on('click', '.product-detail-page', function(event){

			console.log($(this).attr('data-product-id'));

			// product detail
			console.log('click -> product-detail');

			self.getProductDetail($(this).attr('data-product-id'));
		});

		$('body').pagecontainer('change', '#home');

	}).fail(function(jqXHR, textStatus, error){

		console.log(jqXHR, textStatus, error);

	});
};


$.mobile.document.on('pagecreate', '#home', function(){

	var webStorage = new WebStorage();

	var info = new Info();

	/* Verificando soporte para sessionStorage en el contenedor web */
	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if (webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#home` OK');

			// product list
			info.getProductList();

		} else {

			console.log('Cambiando de Pagina');

			$('body').pagecontainer('change', '#options');
		}

	} else {

		console.log('No soporta sessionStorage :(');
	}
});


$.mobile.document.on('pagecreate', '#options', function(){

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


$.mobile.document.on('pagecreate', '#login', function(){

	var webStorage = new WebStorage();

	var info = new Info();

	if(webStorage.sessionStorageSupported()){

		if (webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#login` OK');

			$('body').pagecontainer('change', '#home');

		} else {

			$.mobile.document.on('click', '#button-access', function(event){

				var email = $('#email-login').val();
				var password = $('#password-login').val();

				$.post('http://192.168.0.3:7070/api/v1/user/login', {"email":email, "password":password}, function(data){

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

							console.log('login access');

							info.getProductList();
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


$.mobile.document.on('pagecreate', '#register', function(){

	var webStorage = new WebStorage();

	var info = new Info();

	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if(webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#register` OK');

		} else {

			$.mobile.document.on('click', '#button-register', function(event){

				var email = $('#email-register').val();
				var firstname = $('#firstname-register').val();
				var lastname = $('#lastname-register').val();
				var phone = $('#phone-register').val();
				var password = $('#password-register').val();

				$.post('http://192.168.0.3:7070/api/v1/user/create',

					{
						"email":email,
						"firstname":firstname,
						"lastname":lastname,
						"phone":phone,
						"password":password
					}

					, function(data){

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

								info.getProductList();
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


$.mobile.document.on('pagecreate', '#forgot-password', function(){

	$.mobile.document.on('click', '#button-forgot-password', function(event){

		var onConfirm = function(buttonIndex){

			var info = new Info();

			if (buttonIndex === 1){

				var email = $('#email-forgot-password').val();
				var password = $('#password-forgot-password').val();

				$.post('http://192.168.0.3:7070/api/v1/user/' + email + '/password',
					{
						"password":password
					},

					function(data){

						console.log(data);

						window.sessionStorage.setItem('cookie', data.cookie);
				 		window.localStorage.setItem('email', data.email);
						window.localStorage.setItem('firstname', data.firstname);
						window.localStorage.setItem('lastname', data.lastname);
						window.localStorage.setItem('password', data.password);
						window.localStorage.setItem('phone', data.phone);

						info.getProductList();

						return false;

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


$.mobile.document.on('pagecreate', '#profile-detail', function(event){

	event.preventDefault();

	var webStorage = new WebStorage();

	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if (webStorage.sessionStorageCheck()){

			console.log(window.localStorage.getItem('email'));

			$('#email-profile-detail').val(window.localStorage.getItem('email'));
			$('#firstname-profile-detail').val(window.localStorage.getItem('firstname'));
			$('#lastname-profile-detail').val(window.localStorage.getItem('lastname'));
			$('#phone-profile-detail').val(window.localStorage.getItem('phone'));


			$.mobile.document.on('click', '#button-profile-detail', function(event){

				if ($('#firstname-profile-detail').attr('disabled') === 'disabled' ||
				    $('#lastname-profile-detail').attr('disabled') === 'disabled' ||
						$('#phone-profile-detail').attr('disabled') === 'disabled') {

					$('#firstname-profile-detail, #lastname-profile-detail, #phone-profile-detail').removeAttr('disabled');
					$('#firstname-profile-detail, #lastname-profile-detail, #phone-profile-detail').parent().removeClass('ui-state-disabled');
					$('#email-profile-detail').attr('disabled', 'disabled');

      		event.preventDefault();

				} else {

					var onConfirm = function(buttonIndex){

						if (buttonIndex === 1){

							var email = window.localStorage.getItem('email');
							var password = window.localStorage.getItem('password');
							var firstname = $('#firstname-profile-detail').val();
							var lastname = $('#lastname-profile-detail').val();
							var phone = $('#phone-profile-detail').val();

							$.post('http://192.168.0.3:7070/api/v1/user/' + email + '/update',
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

									$('#email-profile-detail, #firstname-profile-detail, #lastname-profile-detail, #phone-profile-detail').attr('disabled', 'disabled');
									$('#firstname-profile-detail, #lastname-profile-detail, #phone-profile-detail').parent().addClass('ui-state-disabled');

								}).fail(function(jqXHR, textStatus, error){

							 	console.log(textStatus, error);
							 });

						} else {

							$('#content-forgot-password-form').trigger('reset');

						}
					}

					navigator.notification.confirm('Aceptar el cambio de información', onConfirm, 'Actualizar Info', ['Aceptar', 'Cancelar']);

					event.preventDefault();
			}
		});

		} else {

			console.log('Cambiando de Pagina');

			$('body').pagecontainer('change', '#options');
		}

	} else {
		console.log('No soporta sessionStorage :(');
	}
});


$.mobile.document.on('pagecreate', '#product-create', function(){

	var webStorage = new WebStorage();

	var info = new Info();

	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if(webStorage.sessionStorageCheck()){

			console.log('sessionStorage `#product-create` OK');

			$.mobile.document.on('click', '#button-product-create', function(event){

				console.log('#button-product-create');

				var name = $('#name-product-create').val();
				var type = $('#type-product-create').val();
				var quantity = $('#quantity-product-create').val();
				var amount = $('#amount-product-create').val();

				$.post('http://192.168.0.3:7070/api/v1/product/create',
					{
						"name": name,
						"type": type,
						"quantity": quantity,
						"amount": amount
					}

				, function(data){

					 	if(Object.keys(data).indexOf('error') === 0){

					 		var onAlert = function(){

					 			$('#content-register-form').trigger('reset');
					 		};

					 		navigator.notification.alert('Algo salio mal revisa el Formulario', onAlert, '¡Error!', 'Aceptar');

					 	} else {

					 		window.localStorage.setItem('name', data.name);
					 		window.localStorage.setItem('type', data.type);
							window.localStorage.setItem('quantity', data.quantity);
							window.localStorage.setItem('amount', data.amount);
							window.localStorage.setItem('product_id', data.id);

							info.getProductList();

					 	}

				 }).fail(function(jqXHR, textStatus, error){

				 	console.log(textStatus, error);
				 });

				 event.preventDefault();
			});

		} else {

			console.log('No tienes sesion activa :(');
		}
	} else {
		console.log('No soporta sessionStorage :(');
	}
});


$.mobile.document.on('pagecreate', '#product-detail', function(event){

	event.preventDefault();

	var webStorage = new WebStorage();

	if (webStorage.sessionStorageSupported()){

		console.log('sessionStorage support OK');

		if (webStorage.sessionStorageCheck()){

			$.mobile.document.on('click', '#button-product-detail', function(event){

				if ($('#name-product-detail').attr('disabled') === 'disabled' ||
				    $('#type-product-detail').attr('disabled') === 'disabled' ||
						$('#quantity-product-detail').attr('disabled') === 'disabled' ||
						$('#amount-product-detail').attr('disabled') === 'disabled') {

					$('#name-product-detail, #type-product-detail, #quantity-product-detail, #amount-product-detail').removeAttr('disabled');
					$('#name-product-detail, #type-product-detail, #quantity-product-detail, #amount-product-detail').parent().removeClass('ui-state-disabled');

      		event.preventDefault();

				} else {

					var onConfirm = function(buttonIndex){

						var info = new Info();

						if (buttonIndex === 1){

							var name = $('#name-product-detail').val();
							var type = $('#type-product-detail').val();
							var quantity = $('#quantity-product-detail').val();
							var amount = $('#amount-product-detail').val();
							var id =  window.localStorage.getItem('product_id');

							$.post('http://192.168.0.3:7070/api/v1/product/' + id + '/update',
								{
									"name":name,
									"type":type,
									"quantity":quantity,
									"amount":amount
								},
								function(data){

									console.log(data);
									window.localStorage.setItem('name', data.name);
									window.localStorage.setItem('type', data.type);
									window.localStorage.setItem('quantity', data.quantity);
									window.localStorage.setItem('amount', data.amount);
									window.localStorage.setItem('product_id', data.id);

									$('#name-product-detail, #type-product-detail, #quantity-product-detail, #amount-product-detail').attr('disabled', 'disabled')
									$('#name-product-detail, #type-product-detail, #quantity-product-detail, #amount-product-detail').parent().addClass('ui-state-disabled');

									info.getProductList();

									return false;

								}).fail(function(jqXHR, textStatus, error){

							 	console.log(textStatus, error);
							 });

						} else {

							$('#content-product-detail-form').trigger('reset');

						}
					}
					navigator.notification.confirm('Aceptar el cambio de información', onConfirm, 'Actualizar Info', ['Aceptar', 'Cancelar']);

					event.preventDefault();
			}
		});

		} else {

			console.log('Cambiando de Pagina');

			$('body').pagecontainer('change', '#options');
		}

	} else {
		console.log('No soporta sessionStorage :(');
	}
});
