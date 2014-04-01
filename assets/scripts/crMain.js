crMain = { // TODO: renombrar a crPage o crApp ?
	aPages: [],
	
	init: function() {
		$.support.pushState = (history.pushState == false ? false : true);
		
		this.initEvents();
		this.iniAppAjax();
		crMenu.initMenu();
		resizeWindow();
		
		// TODO: seteamos el evento global o de a uno a cada link ?
//		$.showWaiting(false);
	},
	
	initEvents: function() {
		$.countProcess = 0;
		
		$.ajaxSetup({dataType: "json"});
		
		
		/**
		 * Propiedades por default para los ajax:
		 * 		skipwWaiting: omite postrar el divWaiting en cada peticion
		 * */
		$(document).ajaxSend(
			function(event, jqXHR, ajaxOptions) {
				if (ajaxOptions.skipwWaiting === true) {
					return;
				}
				$.countProcess ++;
				$.showWaiting();	
			}
		);

		$(document).ajaxComplete(
			function(event, jqXHR, ajaxOptions) {
				if (ajaxOptions.skipwWaiting === true) {
					return;
				}
				$.countProcess --;
				$.showWaiting();	
			}
		);
		
		$(document).ajaxError(
			function(event, jqXHR, ajaxOptions) {
				if (jqXHR.status === 0 && jqXHR.statusText === 'abort') {
					return;
				}
				if (jqXHR.status === 0 && jqXHR.statusText === 'error') {
					$(document).crAlert( {
						'msg': 			_msg['Not connected. Please verify your network connection'],
						'isConfirm': 	true,
						'confirmText': 	_msg['Retry'],
						'callback': 	$.proxy(
							function() { $.ajax(ajaxOptions); }
						, this)
					});
					return;
				}
				
				var response = $.parseJSON(jqXHR.responseText);
				$.hasAjaxDefaultAction(response);
			}
		);	
	},
	
	iniAppAjax: function() {
		if ($.support.pushState == false) {
			return;
		}		
cn('iniAppAjax!');		

		$.ajax({
			'url': 		base_url + 'app/selectMenuAndTranslations',
			'async':	false,
			'success': 
				function(response) {
					_msg = response['result']['aLangs']; // TODO: meter _msg en algun lado, que no sea global
		
					var aMenu = response['result']['aMenu'];
					for (var menuName in aMenu) {
						var $menu = $(aMenu[menuName]['parent']);
						$menu.children().remove();
						crMenu.renderMenu(aMenu[menuName]['items'], aMenu[menuName]['className'], $menu);
					}
					
					$('#header').on('click', 'a',
						function(event) {
							crMain.clickAppLink(event);
						}
					);					
				}
		});

		$(window).bind("popstate", function () {  
			crMain.loadUrl(location.href);
		});  

//if ($('.container > .page').length == 0) {
	crMain.loadUrl(location.href);
//}
	},
	
	
	/**
	 * Propiedades que se setean desde el js de cada page; se guardan dentro $page.data(); se pueden setear desde la view ajax, o desde un js
	 * 		skipAppLink: omite inicializar todos los links con 'linkInApp'  
	 * 		notRefresh: no vuelve a pedir la page, solo muestra lo que ya hay en memoria
	 * Eventos que dispara cada page; hay que setearlo en el js de cada page
	 * 		onHide: se lanza al ocultar la page
	 * 		onVisible: se lanza al mostrar la page
	 * 
	 * */
	loadUrl: function(controller) {
		var pageName = this.getPageName();
		this.aPages[pageName] = $('.container > .' + pageName);
		if (this.aPages[pageName].length == 0) {
			this.aPages[pageName] = $('<div class="page ' + pageName + '"/>').appendTo($('.container'));
		}

		if (this.ajax) {
			this.ajax.abort();
			this.ajax = null;
		}
		
		var url 	= base_url + controller.replace(base_url, '');
		var $page 	= this.aPages[pageName];
		if ($page.data('notRefresh') == true) {
cn($page);
			this.showPage(pageName);
			return;
		}
		
		this.ajax = $.ajax({
			'url': 		url,
			'data': 	{ 'appType': 'ajax' },
			'async':	true,
			'success': 
				function(response) {
					if ($.hasAjaxDefaultAction(response) == true) { return; }
					
					// FIXME: Elimino estos divs, sino se van agregando todo el tiempo. Son de objectos de jquery calendar, drodown, etc
					$('.datetimepicker, select2-drop, .select2-hidden-accessible').remove();
					
					var data 	= response['result'];
					var $page 	= crMain.aPages[data['pageName']];
					$page.data(data);
					
					crMain.showPage(pageName);
					$page.children().remove();
					crMain.renderPageTitle(data, $page);
					
					switch (data['js']) {
						case 'crList':
							$(null).crList($.extend({
								'autoRender': 	true,
								'$parentNode': 	$(crMain.aPages[pageName])
							} , data['list']));
							break;
						case 'crForm':
							$(null).crForm( $.extend({
								'autoRender': 	true,
								'$parentNode': 	$(crMain.aPages[pageName])
							} , data['form']));
							break;
						default:
							$page.append(data['html']);
					}
					
					if ($page.data('skipAppLink') != true) {
						$page.on('click', 'a',
							function(event) {
								crMain.clickAppLink(event);
							}
						);
					}
				}
		})
	},
	
	renderPageTitle: function(data, $page) {
		$('title').text(data['title'] + ' | ' + SITE_NAME);
		
		if (data['breadcrumb'] != null) {
			$('<ol class="breadcrumb">').appendTo($page);
// TODO: implementar!			
			/*
			for ($breadcrumb as $link) {
				if (element('active', $link) == true) {
					echo '<li class="active"> '.$link['text'].'</li>';
				}
				else {
					echo '<li><a href="'.$link['href'].'">'.$link['text'].'</a></li>';
				} 
			}*/
		}

		if (data['showTitle'] == null) {
			data['showTitle'] = true;
		}
		if (data['showTitle'] == true) {
			$pageTitle = $('\
				<div class="pageTitle">\
					<h2> <small> </small></h2>\
				</div>\
			').appendTo($page);
			
			$pageTitle.find('h2').text(data['title']);
		}

	},
	
	showPage: function(pageName) {
// TODO: revisar si queda bien algun efecto, comentando la duration hace cosas copadas		
		$.showWaiting(true);
		var $page 	= this.aPages[pageName];
		$('.container > .page:visible:not(.' + pageName + ')').hide( { 
			'duration': 0,
			'complete': function(){ 
cn(this);				
				$(this).trigger('onHide'); } 
		});
		$page.stop().show( { 
			'duration': 0,
			'complete': function(){ $(this).trigger('onVisible'); } 
		});		
		$.showWaiting(false);
	},
	
	getPageName: function() {
		var pageName = location.href.replace(base_url, '');
		if (pageName.indexOf('?') != -1){
			pageName = pageName.substr(0, pageName.indexOf('?'));
		}		
		var aTmp = pageName.split('/');
		var controller = aTmp[0];
		if (controller.trim() == '') {
			controller = PAGE_HOME;
		}
		
		return 'cr-page-' + controller + (aTmp.length > 1 ? '-' + aTmp[1] : '');
	},

	/**
	 * Modifica un link para que la page se carge por ajax. 
	 * Para omitir este comportamiento se puede setear
	 * 		skipAppLink = true 			a nivel de la page. Desde el json o desde el js personalizado
	 * 		skip-app-link = true 		como property de un <a/>
 	 */		
	clickAppLink: function(event) {
		if (event.button != 0) {
			return;
		}
		if ($.support.pushState == false) {
			return;
		}
		
		var $link 	= $(event.currentTarget);
		if ($link.data('skip-app-link') == true) {
			return;
		}	
		var url = $link.attr('href');
		if (url == null || url.substr(0, 1) == '#' || url.substr(0, 10) == 'javascript') {
			return;
		}
		event.preventDefault();
		return $.goToUrl(url);
	}
};

$(document).ready( function() {
	crMain.init(); 
});