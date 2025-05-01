<?php

/**
 * A helper file for Kirby, to provide autocomplete information to your IDE.
 * This file was automatically generated with the Kirby Types plugin.
 *
 * @see https://github.com/lukaskleinschmidt/kirby-types
 */

namespace Kirby\Cms
{
    class Site
    {
        /**
         * Returns the addressHeadline field.
         *
         * Uses a `headline` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/headline
         */
        public function addressHeadline(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->addressHeadline();
        }
        /**
         * Returns the address1 field.
         *
         * Uses a `text` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function address1(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->address1();
        }
        /**
         * Returns the address2 field.
         *
         * Uses a `text` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function address2(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->address2();
        }
        /**
         * Returns the postal-code field.
         *
         * Uses a `text` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function postal-code(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->postal-code();
        }
        /**
         * Returns the city field.
         *
         * Uses a `text` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function city(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->city();
        }
        /**
         * Returns the phoneMailHeadline field.
         *
         * Uses a `headline` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/headline
         */
        public function phoneMailHeadline(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->phoneMailHeadline();
        }
        /**
         * Returns the phone field.
         *
         * Uses a `tel` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/tel
         */
        public function phone(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->phone();
        }
        /**
         * Returns the email field.
         *
         * Uses a `email` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/email
         */
        public function email(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->email();
        }
        /**
         * Returns the socialHeadline field.
         *
         * Uses a `headline` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/headline
         */
        public function socialHeadline(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->socialHeadline();
        }
        /**
         * Returns the facebook field.
         *
         * Uses a `text` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function facebook(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->facebook();
        }
        /**
         * Returns the twitter field.
         *
         * Uses a `text` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function twitter(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->twitter();
        }
        /**
         * Returns the main_image field.
         *
         * Uses a `files` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/files
         */
        public function main_image(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->main_image();
        }
        /**
         * Returns the footer_navigation field.
         *
         * Uses a `pages` field in the `site` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/pages
         */
        public function footer_navigation(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Site $instance */
            return $instance->footer_navigation();
        }
    }
    class Page
    {
        /**
         * Returns the contact_persons field.
         *
         * Uses a `pages` field in the `pages/contact` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/pages
         */
        public function contact_persons(): \Kirby\Cms\Field
        {
            /** @var \Kirby\Cms\Page $instance */
            return $instance->contact_persons();
        }
        public function metaTags($groups = null)
        {
            /** @var \Kirby\Cms\Page $instance */
            return $instance->metaTags($groups);
        }
    }
    class Field
    {
        /**
         * Converts the field value into a proper boolean and inverts it
         *
         * @return bool
         */
        public function isFalse(): bool
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->isFalse();
        }
        /**
         * Converts the field value into a proper boolean
         *
         * @return bool
         */
        public function isTrue(): bool
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->isTrue();
        }
        /**
         * Validates the field content with the given validator and parameters
         *
         * @param string $validator
         * @param mixed ...$arguments A list of optional validator arguments
         * @return bool
         */
        public function isValid(string $validator, ...$arguments): bool
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->isValid($validator, ...$arguments);
        }
        /**
         * Converts a yaml or json field to a Blocks object
         *
         * @return \Kirby\Cms\Blocks|\Kirby\Cms\Block[]
         */
        public function toBlocks()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toBlocks();
        }
        /**
         * Converts the field value into a proper boolean
         *
         * @param bool $default Default value if the field is empty
         * @return bool
         */
        public function toBool($default = false): bool
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toBool($default);
        }
        /**
         * Parses the field value with the given method
         *
         * @param string $method [',', 'yaml', 'json']
         * @return array
         */
        public function toData(string $method = ',')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toData($method);
        }
        /**
         * Converts the field value to a timestamp or a formatted date
         *
         * @param string|\IntlDateFormatter|null $format PHP date formatting string
         * @param string|null $fallback Fallback string for `strtotime` (since 3.2)
         * @return string|int
         */
        public function toDate($format = null, ?string $fallback = null)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toDate($format, $fallback);
        }
        /**
         * Returns a file object from a filename in the field
         *
         * @return \Kirby\Cms\File|null
         */
        public function toFile()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toFile();
        }
        /**
         * Returns a file collection from a yaml list of filenames in the field
         *
         * @param string $separator
         * @return \Kirby\Cms\Files|\Kirby\Cms\File[]
         */
        public function toFiles(string $separator = 'yaml')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toFiles($separator);
        }
        /**
         * Converts the field value into a proper float
         *
         * @param float $default Default value if the field is empty
         * @return float
         */
        public function toFloat(float $default = 0.0)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toFloat($default);
        }
        /**
         * Converts the field value into a proper integer
         *
         * @param int $default Default value if the field is empty
         * @return int
         */
        public function toInt(int $default)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toInt($default);
        }
        /**
         * Parse layouts and turn them into
         * Layout objects
         *
         * @return \Kirby\Cms\Layouts|\Kirby\Cms\Layout[]
         */
        public function toLayouts()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toLayouts();
        }
        /**
         * Wraps a link tag around the field value. The field value is used as the link text
         *
         * @param mixed $attr1 Can be an optional Url. If no Url is set, the Url of the Page, File or Site will be used. Can also be an array of link attributes
         * @param mixed $attr2 If `$attr1` is used to set the Url, you can use `$attr2` to pass an array of additional attributes.
         * @return string
         */
        public function toLink($attr1 = null, $attr2 = null)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toLink($attr1, $attr2);
        }
        /**
         * Parse yaml data and convert it to a
         * content object
         *
         * @return \Kirby\Cms\Content
         */
        public function toObject()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toObject();
        }
        /**
         * Returns a page object from a page id in the field
         *
         * @return \Kirby\Cms\Page|null
         */
        public function toPage()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toPage();
        }
        /**
         * Returns a pages collection from a yaml list of page ids in the field
         *
         * @param string $separator Can be any other separator to split the field value by
         * @return \Kirby\Cms\Pages|\Kirby\Cms\Page[]
         */
        public function toPages(string $separator = 'yaml')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toPages($separator);
        }
        /**
         * Converts a yaml field to a Structure object
         *
         * @return \Kirby\Cms\Structure|\Kirby\Cms\StructureObject[]
         */
        public function toStructure()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toStructure();
        }
        /**
         * Converts the field value to a Unix timestamp
         *
         * @return int|false
         */
        public function toTimestamp(): int|false
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toTimestamp();
        }
        /**
         * Turns the field value into an absolute Url
         *
         * @return string
         */
        public function toUrl(): string
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toUrl();
        }
        /**
         * Converts a user email address to a user object
         *
         * @return \Kirby\Cms\User|null
         */
        public function toUser()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toUser();
        }
        /**
         * Returns a users collection from a yaml list of user email addresses in the field
         *
         * @param string $separator
         * @return \Kirby\Cms\Users|\Kirby\Cms\User[]
         */
        public function toUsers(string $separator = 'yaml')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toUsers($separator);
        }
        /**
         * Returns the length of the field content
         */
        public function length()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->length();
        }
        /**
         * Returns the number of words in the text
         */
        public function words()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->words();
        }
        /**
         * Applies the callback function to the field
         *
         * @since 3.4.0
         * @param \Closure $callback
         */
        public function callback(\Closure $callback)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->callback($callback);
        }
        /**
         * Escapes the field value to be safely used in HTML
         * templates without the risk of XSS attacks
         *
         * @param string $context Location of output (`html`, `attr`, `js`, `css`, `url` or `xml`)
         */
        public function escape(string $context = 'html')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->escape($context);
        }
        /**
         * Creates an excerpt of the field value without html
         * or any other formatting.
         *
         * @param int $cahrs
         * @param bool $strip
         * @param string $rep
         * @return \Kirby\Cms\Field
         */
        public function excerpt(int $chars, bool $strip = true, string $rep = ' …')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->excerpt($chars, $strip, $rep);
        }
        /**
         * Converts the field content to valid HTML
         *
         * @return \Kirby\Cms\Field
         */
        public function html()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->html();
        }
        /**
         * Strips all block-level HTML elements from the field value,
         * it can be safely placed inside of other inline elements
         * without the risk of breaking the HTML structure.
         *
         * @since 3.3.0
         * @return \Kirby\Cms\Field
         */
        public function inline()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->inline();
        }
        /**
         * Converts the field content from Markdown/Kirbytext to valid HTML
         *
         * @param array $options
         * @return \Kirby\Cms\Field
         */
        public function kirbytext(array $options = [])
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->kirbytext($options);
        }
        /**
         * Converts the field content from inline Markdown/Kirbytext
         * to valid HTML
         *
         * @since 3.1.0
         * @param array $options
         * @return \Kirby\Cms\Field
         */
        public function kirbytextinline(array $options = [])
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->kirbytextinline($options);
        }
        /**
         * Parses all KirbyTags without also parsing Markdown
         *
         * @return \Kirby\Cms\Field
         */
        public function kirbytags()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->kirbytags();
        }
        /**
         * Converts the field content to lowercase
         *
         * @return \Kirby\Cms\Field
         */
        public function lower()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->lower();
        }
        /**
         * Converts markdown to valid HTML
         *
         * @param array $options
         * @return \Kirby\Cms\Field
         */
        public function markdown(array $options = [])
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->markdown($options);
        }
        /**
         * Converts all line breaks in the field content to `<br>` tags.
         *
         * @since 3.3.0
         * @return \Kirby\Cms\Field
         */
        public function nl2br()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->nl2br();
        }
        /**
         * Uses the field value as Kirby query
         *
         * @param string|null $expect
         * @return mixed
         */
        public function query(?string $expect = null)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->query($expect);
        }
        /**
         * It parses any queries found in the field value.
         *
         * @param array $data
         * @param string|null $fallback Fallback for tokens in the template that cannot be replaced
         * (`null` to keep the original token)
         * @return \Kirby\Cms\Field
         */
        public function replace(array $data = [], ?string $fallback = '')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->replace($data, $fallback);
        }
        /**
         * Cuts the string after the given length and
         * adds "…" if it is longer
         *
         * @param int $length The number of characters in the string
         * @param string $appendix An optional replacement for the missing rest
         * @return \Kirby\Cms\Field
         */
        public function short(int $length, string $appendix = '…')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->short($length, $appendix);
        }
        /**
         * Converts the field content to a slug
         *
         * @return \Kirby\Cms\Field
         */
        public function slug()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->slug();
        }
        /**
         * Applies SmartyPants to the field
         *
         * @return \Kirby\Cms\Field
         */
        public function smartypants()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->smartypants();
        }
        /**
         * Splits the field content into an array
         *
         * @return array
         */
        public function split($separator = ',')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->split($separator);
        }
        /**
         * Converts the field content to uppercase
         *
         * @return \Kirby\Cms\Field
         */
        public function upper()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->upper();
        }
        /**
         * Avoids typographical widows in strings by replacing
         * the last space with `&nbsp;`
         *
         * @return \Kirby\Cms\Field
         */
        public function widont()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->widont();
        }
        /**
         * Converts the field content to valid XML
         *
         * @return \Kirby\Cms\Field
         */
        public function xml()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->xml();
        }
        /**
         * Parses yaml in the field content and returns an array
         *
         * @return array
         */
        public function yaml(): array
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->yaml();
        }
        /**
         * Converts the field value into a proper boolean
         *
         * @param bool $default Default value if the field is empty
         * @return bool
         */
        public function bool($default = false): bool
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toBool($default);
        }
        /**
         * Escapes the field value to be safely used in HTML
         * templates without the risk of XSS attacks
         *
         * @param string $context Location of output (`html`, `attr`, `js`, `css`, `url` or `xml`)
         */
        public function esc(string $context = 'html')
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->escape($context);
        }
        /**
         * Converts the field value into a proper float
         *
         * @param float $default Default value if the field is empty
         * @return float
         */
        public function float(float $default = 0.0)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toFloat($default);
        }
        /**
         * Converts the field content to valid HTML
         *
         * @return \Kirby\Cms\Field
         */
        public function h()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->html();
        }
        /**
         * Converts the field value into a proper integer
         *
         * @param int $default Default value if the field is empty
         * @return int
         */
        public function int(int $default)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toInt($default);
        }
        /**
         * Converts the field content from Markdown/Kirbytext to valid HTML
         *
         * @param array $options
         * @return \Kirby\Cms\Field
         */
        public function kt(array $options = [])
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->kirbytext($options);
        }
        /**
         * Converts the field content from inline Markdown/Kirbytext
         * to valid HTML
         *
         * @since 3.1.0
         * @param array $options
         * @return \Kirby\Cms\Field
         */
        public function kti(array $options = [])
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->kirbytextinline($options);
        }
        /**
         * Wraps a link tag around the field value. The field value is used as the link text
         *
         * @param mixed $attr1 Can be an optional Url. If no Url is set, the Url of the Page, File or Site will be used. Can also be an array of link attributes
         * @param mixed $attr2 If `$attr1` is used to set the Url, you can use `$attr2` to pass an array of additional attributes.
         * @return string
         */
        public function link($attr1 = null, $attr2 = null)
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toLink($attr1, $attr2);
        }
        /**
         * Converts markdown to valid HTML
         *
         * @param array $options
         * @return \Kirby\Cms\Field
         */
        public function md(array $options = [])
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->markdown($options);
        }
        /**
         * Applies SmartyPants to the field
         *
         * @return \Kirby\Cms\Field
         */
        public function sp()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->smartypants();
        }
        /**
         * Validates the field content with the given validator and parameters
         *
         * @param string $validator
         * @param mixed ...$arguments A list of optional validator arguments
         * @return bool
         */
        public function v(string $validator, ...$arguments): bool
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->isValid($validator, ...$arguments);
        }
        /**
         * Converts the field content to valid XML
         *
         * @return \Kirby\Cms\Field
         */
        public function x()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->xml();
        }
        public function toLocation()
        {
            /** @var \Kirby\Cms\Field $instance */
            return $instance->toLocation();
        }
    }
    class Pages
    {
        public function feed($options = [], $force = null)
        {
            /** @var \Kirby\Cms\Pages $instance */
            return $instance->feed($options, $force);
        }
        public function sitemap($options = [], $force = null)
        {
            /** @var \Kirby\Cms\Pages $instance */
            return $instance->sitemap($options, $force);
        }
    }
    class Content
    {
        /**
         * Returns all registered field objects
         *
         * @return \Kirby\Cms\Field[]
         */
        public function fields(): array
        {
            /** @var \Kirby\Cms\Content $instance */
            return $instance->fields();
        }
    }
    class Layout
    {
        /**
         * Returns the columns in this layout
         *
         * @return \Kirby\Cms\LayoutColumns|\Kirby\Cms\LayoutColumn[]
         */
        public function columns()
        {
            /** @var \Kirby\Cms\Layout $instance */
            return $instance->columns();
        }
    }
    class LayoutColumn
    {
        /**
         * Returns the blocks collection
         *
         * @param bool $includeHidden Sets whether to include hidden blocks
         * @return \Kirby\Cms\Blocks|\Kirby\Cms\Block[]
         */
        public function blocks(bool $includeHidden = false)
        {
            /** @var \Kirby\Cms\LayoutColumn $instance */
            return $instance->blocks($includeHidden);
        }
    }
}

namespace 
{
    class DefaultPage
    {
        /**
         * Returns the text field.
         *
         * Uses a `blocks` field in the `pages/default` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/blocks
         */
        public function text(): \Kirby\Cms\Field
        {
            /** @var \DefaultPage $instance */
            return $instance->text();
        }
        public function metaTags($groups = null)
        {
            /** @var \DefaultPage $instance */
            return $instance->metaTags($groups);
        }
    }
    class EventPage
    {
        /**
         * Returns the date field.
         *
         * Uses a `date` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/date
         */
        public function date(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->date();
        }
        /**
         * Returns the is_virtual field.
         *
         * Uses a `toggle` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/toggle
         */
        public function is_virtual(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->is_virtual();
        }
        /**
         * Returns the location_name field.
         *
         * Uses a `text` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function location_name(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->location_name();
        }
        /**
         * Returns the location_geo field.
         *
         * Uses a `locator` field in the `pages/event` blueprint.
         */
        public function location_geo(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->location_geo();
        }
        /**
         * Returns the location_url field.
         *
         * Uses a `url` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/url
         */
        public function location_url(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->location_url();
        }
        /**
         * Returns the eventbrite_url field.
         *
         * Uses a `url` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/url
         */
        public function eventbrite_url(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->eventbrite_url();
        }
        /**
         * Returns the text field.
         *
         * Uses a `blocks` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/blocks
         */
        public function text(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->text();
        }
        /**
         * Returns the main_image field.
         *
         * Uses a `files` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/files
         */
        public function main_image(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->main_image();
        }
        /**
         * Returns the textline field.
         *
         * Uses a `text` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function textline(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->textline();
        }
        /**
         * Returns the attendants field.
         *
         * Uses a `pages` field in the `pages/event` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/pages
         */
        public function attendants(): \Kirby\Cms\Field
        {
            /** @var \EventPage $instance */
            return $instance->attendants();
        }
        public function metaTags($groups = null)
        {
            /** @var \EventPage $instance */
            return $instance->metaTags($groups);
        }
    }
    class HomePage
    {
        /**
         * Returns the herotitle field.
         *
         * Uses a `text` field in the `pages/home` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function herotitle(): \Kirby\Cms\Field
        {
            /** @var \HomePage $instance */
            return $instance->herotitle();
        }
        /**
         * Returns the textline field.
         *
         * Uses a `text` field in the `pages/home` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function textline(): \Kirby\Cms\Field
        {
            /** @var \HomePage $instance */
            return $instance->textline();
        }
        public function metaTags($groups = null)
        {
            /** @var \HomePage $instance */
            return $instance->metaTags($groups);
        }
    }
    class PersonPage
    {
        /**
         * Returns the sub_heading field.
         *
         * Uses a `text` field in the `pages/person` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/text
         */
        public function sub_heading(): \Kirby\Cms\Field
        {
            /** @var \PersonPage $instance */
            return $instance->sub_heading();
        }
        /**
         * Returns the website field.
         *
         * Uses a `url` field in the `pages/person` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/url
         */
        public function website(): \Kirby\Cms\Field
        {
            /** @var \PersonPage $instance */
            return $instance->website();
        }
        /**
         * Returns the linkedin field.
         *
         * Uses a `url` field in the `pages/person` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/url
         */
        public function linkedin(): \Kirby\Cms\Field
        {
            /** @var \PersonPage $instance */
            return $instance->linkedin();
        }
        /**
         * Returns the xing field.
         *
         * Uses a `url` field in the `pages/person` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/url
         */
        public function xing(): \Kirby\Cms\Field
        {
            /** @var \PersonPage $instance */
            return $instance->xing();
        }
        /**
         * Returns the main_image field.
         *
         * Uses a `files` field in the `pages/person` blueprint.
         *
         * @see https://getkirby.com/docs/reference/panel/fields/files
         */
        public function main_image(): \Kirby\Cms\Field
        {
            /** @var \PersonPage $instance */
            return $instance->main_image();
        }
        public function metaTags($groups = null)
        {
            /** @var \PersonPage $instance */
            return $instance->metaTags($groups);
        }
    }
}

namespace Kirby\Toolkit
{
    class V
    {
        /**
         * Valid: `'yes' | true | 1 | 'on'`
         */
        public static function accepted($value): bool
        {
            return V::accepted($value);
        }
        /**
         * Valid: `a-z | A-Z`
         */
        public static function alpha($value, bool $unicode = false): bool
        {
            return V::alpha($value, $unicode);
        }
        /**
         * Valid: `a-z | A-Z | 0-9`
         */
        public static function alphanum($value, bool $unicode = false): bool
        {
            return V::alphanum($value, $unicode);
        }
        /**
         * Checks for numbers within the given range
         */
        public static function between($value, $min, $max): bool
        {
            return V::between($value, $min, $max);
        }
        /**
         * Checks if the given string contains the given value
         */
        public static function contains($value, $needle): bool
        {
            return V::contains($value, $needle);
        }
        /**
         * Checks for a valid date or compares two
         * dates with each other.
         *
         * Pass only the first argument to check for a valid date.
         * Pass an operator as second argument and another date as
         * third argument to compare them.
         */
        public static function date(?string $value, ?string $operator = null, ?string $test = null): bool
        {
            return V::date($value, $operator, $test);
        }
        /**
         * Valid: `'no' | false | 0 | 'off'`
         */
        public static function denied($value): bool
        {
            return V::denied($value);
        }
        /**
         * Checks for a value, which does not equal the given value
         */
        public static function different($value, $other, $strict = false): bool
        {
            return V::different($value, $other, $strict);
        }
        /**
         * Checks for valid email addresses
         */
        public static function email($value): bool
        {
            return V::email($value);
        }
        /**
         * Checks for empty values
         */
        public static function empty($value = null): bool
        {
            return V::empty($value);
        }
        /**
         * Checks if the given string ends with the given value
         */
        public static function endsWith(string $value, string $end): bool
        {
            return V::endsWith($value, $end);
        }
        /**
         * Checks for a valid filename
         */
        public static function filename($value): bool
        {
            return V::filename($value);
        }
        /**
         * Checks if the value exists in a list of given values
         */
        public static function in($value, array $in, bool $strict = false): bool
        {
            return V::in($value, $in, $strict);
        }
        /**
         * Checks for a valid integer
         */
        public static function integer($value, bool $strict = false): bool
        {
            return V::integer($value, $strict);
        }
        /**
         * Checks for a valid IP address
         */
        public static function ip($value): bool
        {
            return V::ip($value);
        }
        /**
         * Checks for valid json
         */
        public static function json($value): bool
        {
            return V::json($value);
        }
        /**
         * Checks if the value is lower than the second value
         */
        public static function less($value, float $max): bool
        {
            return V::less($value, $max);
        }
        /**
         * Checks if the value matches the given regular expression
         */
        public static function match($value, string $pattern): bool
        {
            return V::match($value, $pattern);
        }
        /**
         * Checks if the value does not exceed the maximum value
         */
        public static function max($value, float $max): bool
        {
            return V::max($value, $max);
        }
        /**
         * Checks if the value is higher than the minimum value
         */
        public static function min($value, float $min): bool
        {
            return V::min($value, $min);
        }
        /**
         * Checks if the number of characters in the value equals or is below the given maximum
         */
        public static function maxLength(?string $value, $max): bool
        {
            return V::maxLength($value, $max);
        }
        /**
         * Checks if the number of characters in the value equals or is greater than the given minimum
         */
        public static function minLength(?string $value, $min): bool
        {
            return V::minLength($value, $min);
        }
        /**
         * Checks if the number of words in the value equals or is below the given maximum
         */
        public static function maxWords(?string $value, $max): bool
        {
            return V::maxWords($value, $max);
        }
        /**
         * Checks if the number of words in the value equals or is below the given maximum
         */
        public static function minWords(?string $value, $min): bool
        {
            return V::minWords($value, $min);
        }
        /**
         * Checks if the first value is higher than the second value
         */
        public static function more($value, float $min): bool
        {
            return V::more($value, $min);
        }
        /**
         * Checks that the given string does not contain the second value
         */
        public static function notContains($value, $needle): bool
        {
            return V::notContains($value, $needle);
        }
        /**
         * Checks that the given value is not empty
         */
        public static function notEmpty($value): bool
        {
            return V::notEmpty($value);
        }
        /**
         * Checks that the given value is not in the given list of values
         */
        public static function notIn($value, $notIn): bool
        {
            return V::notIn($value, $notIn);
        }
        /**
         * Checks for a valid number / numeric value (float, int, double)
         */
        public static function num($value): bool
        {
            return V::num($value);
        }
        /**
         * Checks if the value is present
         */
        public static function required($value, $array = null): bool
        {
            return V::required($value, $array);
        }
        /**
         * Checks that the first value equals the second value
         */
        public static function same($value, $other, bool $strict = false): bool
        {
            return V::same($value, $other, $strict);
        }
        /**
         * Checks that the value has the given size
         */
        public static function size($value, $size, $operator = '=='): bool
        {
            return V::size($value, $size, $operator);
        }
        /**
         * Checks that the string starts with the given start value
         */
        public static function startsWith(string $value, string $start): bool
        {
            return V::startsWith($value, $start);
        }
        /**
         * Checks for valid time
         */
        public static function time($value): bool
        {
            return V::time($value);
        }
        /**
         * Checks for a valid Url
         */
        public static function url($value): bool
        {
            return V::url($value);
        }
        /**
         * Checks for a valid Uuid, optionally for specific model type
         */
        public static function uuid(string $value, ?string $type = null): bool
        {
            return V::uuid($value, $type);
        }
    }
}

namespace 
{
    class Collection extends \Kirby\Cms\Collection {}
    class Field extends \Kirby\Cms\Field {}
    class File extends \Kirby\Cms\File {}
    class Files extends \Kirby\Cms\Files {}
    class Find extends \Kirby\Cms\Find {}
    class Helpers extends \Kirby\Cms\Helpers {}
    class Html extends \Kirby\Cms\Html {}
    class kirby extends \Kirby\Cms\App {}
    class Page extends \Kirby\Cms\Page {}
    class Pages extends \Kirby\Cms\Pages {}
    class Pagination extends \Kirby\Cms\Pagination {}
    class R extends \Kirby\Cms\R {}
    class Response extends \Kirby\Cms\Response {}
    class S extends \Kirby\Cms\S {}
    class Sane extends \Kirby\Sane\Sane {}
    class Site extends \Kirby\Cms\Site {}
    class Structure extends \Kirby\Cms\Structure {}
    class Url extends \Kirby\Cms\Url {}
    class User extends \Kirby\Cms\User {}
    class Users extends \Kirby\Cms\Users {}
    class Visitor extends \Kirby\Cms\Visitor {}
    class Data extends \Kirby\Data\Data {}
    class Json extends \Kirby\Data\Json {}
    class Yaml extends \Kirby\Data\Yaml {}
    class Asset extends \Kirby\Filesystem\Asset {}
    class Dir extends \Kirby\Filesystem\Dir {}
    class F extends \Kirby\Filesystem\F {}
    class Mime extends \Kirby\Filesystem\Mime {}
    class Database extends \Kirby\Database\Database {}
    class Db extends \Kirby\Database\Db {}
    class ErrorPageException extends \Kirby\Exception\ErrorPageException {}
    class Cookie extends \Kirby\Http\Cookie {}
    class Header extends \Kirby\Http\Header {}
    class Remote extends \Kirby\Http\Remote {}
    class Dimensions extends \Kirby\Image\Dimensions {}
    class Panel extends \Kirby\Panel\Panel {}
    class Snippet extends \Kirby\Template\Snippet {}
    class Slot extends \Kirby\Template\Slot {}
    class A extends \Kirby\Toolkit\A {}
    class c extends \Kirby\Toolkit\Config {}
    class Config extends \Kirby\Toolkit\Config {}
    class Escape extends \Kirby\Toolkit\Escape {}
    class I18n extends \Kirby\Toolkit\I18n {}
    class Obj extends \Kirby\Toolkit\Obj {}
    class Str extends \Kirby\Toolkit\Str {}
    class Tpl extends \Kirby\Toolkit\Tpl {}
    class V extends \Kirby\Toolkit\V {}
    class Xml extends \Kirby\Toolkit\Xml {}
}
