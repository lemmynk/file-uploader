<?php
/**
 * Created by miller
 * Date: 6/10/14
 * Time: 6:59 PM
 */

namespace miller\fileuploader;

use yii\helpers\Html;
use yii\helpers\Json;
use yii\widgets\InputWidget;

class FileUploader extends InputWidget
{
    /**
     * @var string containers id
     */
    public $container = 'uploader';

    /**
     * @var bool validate or not
     */
    public $ajaxValidate = true;
    /**
     * @var array attributes to validate via ajax
     */
    public $ajaxVar = [];

    /**
     * inherit
     */
    public $options = [];

    public function run()
    {
        $view = $this->view;
        FileUploaderAssets::register($view);
        $this->options['inputField'] = Html::activeFileInput($this->model, $this->attribute, ['multiple'=>true]);
        if(!empty($this->ajaxVar)){
            $tmp = array();
            foreach($this->ajaxVar as $var){
                $tmp[] = Html::activeTextInput($this->model, $var, array('class'=>'ajax-validate '.$var , 'style'=>'display: none'));
            }
            $this->options['ajaxVar'] = $tmp;
        }
        echo Html::tag('div', '', ['id'=>$this->container]);
        $this->options['ajaxValidate'] = $this->ajaxValidate;
        $options = Json::encode($this->options);

        $js = "jQuery(\"#{$this->container}\").up({$options});";
        $view->registerJs($js);
    }
} 