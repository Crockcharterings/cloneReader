<?php
/**
 * El form tiene que tener este formato:
 *
 * $form = array(
 *	'frmName'   => 'frmName',
 *	'action'    => base_url('entity/save'), //
 *	'className' => 'panel panel-default crForm form-horizontal' // class del form
 *	'fields'    => array(), // fields que va a incluir el formulario
 *	'rules'     => array(), // reglas de validacion para cada campo
 * 	'buttons'   => array(), // los bottones que se van a mostrar
 *	'info'      => array('position' => 'left|right', 'html' => ''), // si incluye info a los costados
 *	'title'     => 'title',
 *	'icon'      => 'fa fa-edit', // se utiliza en los popup form,
 *	'urlDelete' => base_url('entity/delete'), // url para borrar
 *	'callback'  => function javascript que se llama al enviar el form
 *);
 *
 *	fields:
 * 		$upload = array(
 *			'type'       => 'upload',
 *			'label'      => 'Logo',
 *			'value'      => array('url' => $url, 'name' => $name),
 *			'urlSave'    => base_url('%s/savePicture/'.$id),    // url del controlador para guardar el archivo
 *			'urlDelete'  => base_url('%s/deletePicture/'.$id),  // url del controlador para borrar el archivo
 *			'isPicture'  => true,           // indica si se va a subir una imagen u otro archivo
 * 			'disabled'   => false, // TODO: implementar!
 * 		                           // TODO: implementar acceptFileTypes, maxFileSize, maxNumberOfFiles
 *		);
 * 		En los controladores se pueden llamar a los metodos savePicture o saveFile.
 * 		Estos metodos utilizan un archivo de configuración con el formato:
 * 			$config = array(
 *				'folder'        => '/assets/images/%s/logo/original/',
 *				'allowed_types' => 'gif|jpg|png',
 *				'max_size'      => 1024 * 8,
 *				'sizes'         => array( // solo necesario para savePicture
 *					'thumb' => array( 'width' => 150,  'height' => 150, 'folder' => '/assets/images/%s/logo/thumb/' ),
 *				)
 *			);
 *
 * 		$gallery = array(
 *				'label'         => 'Pictures',
 *				'entityTypeId'  => $entityTypeId,
 *				'entityId'      => $entityId,
 *			);
 * 		Las gallery le pegan al controlador base_url('gallery/savePicture') y necesitan los parametros  $entityTypeId y $entityId
 *		En caso de necesitar validaciones adicionales, se puede customizar el controller y utilizar el helper savePicture
 * 		Los metodos utilizan una configuracion con el formato:
 * 			$config = array(
 *				'controller'    => '%s/edit',                                                   // controller con el que se va a validar que el usuario logeado tenga permisos
 *				'folder'        => '/assets/images/%s/original/',                               // folder con la imagen original
 * 				'urlGallery'    => base_url('gallery/select/$entityTypeId/$entityId),     // url que devuelve un json con todas las imagenes de la gallery
 *				'urlSave'       => base_url('gallery/savePicture'),                             // url del controlador para guardar la imagen
 *				'urlDelete'     => base_url('gallery/deletePicture/$entityTypeId/$fileId),     // url del controlador para borrar la imagen
 *				'allowed_types' => 'gif|jpg|png',
 *				'max_size'      => 1024 * 8,
 *				'sizes'         => array( // thumb y large
 *					'thumb' => array( 'width' => 150,  'height' => 100, 'folder' => '/assets/images/%s/thumb/' ),
 *					'large' => array( 'width' => 1024, 'height' => 660, 'folder' => '/assets/images/%s/large/' ),
 *				)
 *			);
 *
 */

$form        = appendMessagesToCrForm($form);
$htmlTitle   = '';
$htmlFields  = '';
$htmlButtons = '';
$htmlErrors  = '';
$aFields     = renderCrFormFields($form);

$this->form_validation->set_error_delimiters('<li>', '</li>');

if (!isset($form['action'])) {
	$form['action'] = base_url($this->uri->uri_string());
}
if (isset($form['title'])) {
	$htmlTitle = '<div class="panel-heading">'.  $form['title'].'</div>';
}
if(strlen(validation_errors())) {
	$htmlErrors = ' <div class="alert alert-danger"> <ul> '.validation_errors().' </ul> </div>';
}

if (isset($form['info'])) {
	$row = ' <div class="row">
				<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6"> %s </div>
				<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6"> %s </div>
			</div>';
	if ($form['info']['position'] == 'left' ) {
		$htmlFields = sprintf($row, $form['info']['html'], implode(' ', $aFields));
	}
	else {
		$htmlFields = sprintf($row, implode(' ', $aFields), $form['info']['html']);
	}
}
else {
	$htmlFields = implode(' ', $aFields);
}

if (!isset($form['buttons'])) {
	$form['buttons'] = array();
	$form['buttons'][] = '<button type="button" class="btn btn-default" onclick="$.goToUrlList();"><i class="fa fa-arrow-left"></i> '.lang('Back').' </button> ';
	if (isset($form['urlDelete'])) {
		$form['buttons'][] = '<button type="button" class="btn btn-danger"><i class="fa fa-trash-o"></i> '.lang('Delete').' </button>';
	}
	$form['buttons'][] = '<button type="submit" class="btn btn-primary" disabled="disabled"><i class="fa fa-save"></i> '.lang('Save').' </button> ';
}

if (!empty($form['buttons'])) {
	$htmlButtons = '<div class="formButtons panel-footer" > '.implode(' ', $form['buttons']).'</div>';
}


echo form_open($form['action'], array('class' => $form['frmName'].' '.element('className', $form, 'panel panel-default crForm form-horizontal'), 'role' => 'form' ))
	.$htmlTitle.'
	<div class="panel-body">
		'.$htmlErrors.'
		'.$htmlFields.'
	</div>
	'.$htmlButtons.'
	'.form_close();

$this->my_js->add(' $(\'.'.getPageName().' .'. $form['frmName'].'\').crForm('. json_encode($form).'); ');
