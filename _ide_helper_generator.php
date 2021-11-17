<?php
use Kirby\Data\Yaml;
use Kirby\Toolkit\A;
use Kirby\Toolkit\Dir;
use Kirby\Toolkit\F;
use Kirby\Toolkit\V;

/** @var SomeblueprintPage $page * /` in your templates.
 *
 * Happy IDE-ing!
 */

// Import the Kirby Toolkit to make our life easier

$autoloader = __DIR__ . '/vendor/autoload.php';

require($autoloader);

// Set this one to your own blueprint root if you changed it.
$blueprint_root = __DIR__ . DS . 'site' . DS . 'blueprints/pages';

$helperFile = new IDEHelperFile('_ide_helper_models.php');

foreach (Dir::read($blueprint_root) as $filename) {
    $blueprint = Yaml::read($blueprint_root . DS . $filename);

    $filename = F::name($filename);
    $className = 'bp_' . $filename . ' extends \Kirby\Cms\Page';

    $fieldWalker = function (array $props) use (&$fieldWalker): array {
        $fields = [];
        foreach ($props as $key => $prop) {
            if ($key == 'fields' && is_array($prop)) {
                $fields = A::merge($fields, array_keys($prop));
            } elseif (is_array($prop)) {
                $fields = A::merge($fields, $fieldWalker($prop));
            }
        }

        return $fields;
    };

    $fields = $fieldWalker($blueprint);

    if (count($fields) == 0) {
        $helperFile->addEmpty($className);
        continue;
    }

    foreach ($fields as $field) {
        $helperFile->add($className, $field, 'Field');
    }
}

$helperFile->save();




/**
 * Now for Kirby's build in magic methods
 */

$helperFile = new IDEHelperFile('_ide_helper.php');

$fieldMethodsFiles = [];
// Yeah, you can add your Field method-files to this array
$fieldMethodsFiles[] = __DIR__ . DS . 'kirby' . DS . 'config' . DS . 'methods.php';


class Field {
    public static $methods;
}

$fieldMethodsReturnTypes = [];
foreach ($fieldMethodsFiles as $methodsFile) {
    require_once $methodsFile;

    // Just regex them.
    preg_match_all(
        '/\@return (.*?)\n \*\/\nfield::\$methods\[\'(.*?)\'\]/',
        f::read($methodsFile),
        $matches,
        PREG_SET_ORDER
    );

    foreach ($matches as $match) {
        $return = $match[1];
        $method = $match[2];
        $fieldMethodsReturnTypes[$method] = $return;
    }
}

if (is_iterable(field::$methods)) {
    foreach (field::$methods as $name => $method) {
        $func = new ReflectionFunction($method);
        $args = array_map(function ($arg) {
            return $arg->name;
        }, $func->getParameters());
        $return = array_key_exists($name, $fieldMethodsReturnTypes)
            ? $fieldMethodsReturnTypes[$name] : '';

        $helperFile->add('Field', $name, $return, $args);
    }
}

// Also add the v:: validator class
foreach (V::$validators as $name => $validator) {
    $func = new ReflectionFunction($validator);
    $args = array_map(function ($arg) {
        return $arg->name;
    }, $func->getParameters());

    $helperFile->add('V', $name, 'boolean', $args, true);
}

$helperFile->save();


/**
 * Helpers
 */
class IDEHelperFile {

    private string $filename;
    private array $methods = [];

    public function __construct(string $filename) {
        $this->filename = $filename;
    }

    public function add($class, $method, $return, $args = [], $static = false) {
        $this->methods[$class][$method] = [
            'return' => $return,
            'static' => $static,
            'args' => $args,
        ];
    }

    public function addEmpty($class) {
        $this->methods[$class] = [];
    }

    public function save() {
        $helper = "<?php\n";

        foreach ($this->methods as $class => $methods) {
            $helper .= "\n/**\n";

            foreach ($methods as $method => $d) {
                $helper .= ' * @method ';
                $helper .= $d['static'] ? 'static ' : '';
                $helper .= $d['return'] . " $method(";
                $helper .= $d['args'] ? '$' . implode(', $', $d['args']) : '';
                $helper .= ")\n";
            }

            $helper .= " */\nclass $class {}\n";
        }

        F::write($this->filename, $helper);
    }
}