<?php
class Controllers_Model extends CI_Model {
	function selectToList($pageCurrent = null, $pageSize = null, array $filters = array()){
		$this->db
			->select('SQL_CALC_FOUND_ROWS controllerId, controllerName, controllerUrl, IF(controllerActive, \'X\', \'\') AS controllerActive ', false)
			->from('controllers');
			
		if (element('filter', $filters) != null) {
			$this->db->like('controllerName', $filters['filter']);
		}
			
		$this->Commond_Model->appendLimitInQuery($pageCurrent, $pageSize);
		
		$query = $this->db->get();
		//pr($this->db->last_query()); die;

		$query->foundRows = $this->Commond_Model->getFoundRows();
		return $query;
	}
	
	function select($onlyActive = false){
		$query = $this->db->order_by('controllerName');
		
		if ($onlyActive == true) {
			$query->where('controllerActive', true);
		}

		return $query->get('controllers')->result_array();
	}	
	
	
	function selectToDropdown($onlyActive = false){
		$query = $this->db
			->select('controllerId AS id, controllerName AS text', true)
			->order_by('controllerName');
		
		if ($onlyActive == true) {
			$query->where('controllerActive', true);
		}

		return $query->get('controllers')->result_array();
	}

	function get($controllerId){
		$this->db->where('controllerId', $controllerId);
		return $this->db->get('controllers')->row_array();
	}
	
	function save($data){
		$controllerId = $data['controllerId'];
		unset($data['controllerId']);
		
		$data['controllerActive'] = (element('controllerActive', $data) == 'on'); 

		if ((int)$controllerId != 0) {		
			$this->db->where('controllerId', $controllerId);
			$this->db->update('controllers', $data);
		}
		else {
			$this->db->insert('controllers', $data);
		}
		
		$this->load->model('Menu_Model');
		$this->Menu_Model->destroyMenuCache();
		
		return true;
	}
	
	function delete($controllerId) {
		$this->db->delete('controllers', array('controllerId' => $controllerId));
		return true;
	}
	
	function exitsController($controllerName, $controllerId) {
		$this->db->where('controllerName', $controllerName);
		$this->db->where('controllerId !=', $controllerId);
		return ($this->db->get('controllers')->num_rows() > 0);
	}
}
