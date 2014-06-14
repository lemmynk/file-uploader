<?php
/**
 * Created by miller
 * Date: 6/10/14
 * Time: 7:04 PM
 */

namespace miller\fileuploader;

use yii\web\AssetBundle;

class FileUploaderAssets extends AssetBundle
{
    public $sourcePath = '@vendor/miller/yii2-file-uploader/assets';

    public $js = ['js/jquery.uploader.js'];

    public $css = ['css/jquery.uploader.css'];

    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
        'yii\jui\ProgressBarAsset',
    ];
} 