/**
 * GRAPPELLI AUTOCOMPLETE FK
 * foreign-key lookup with autocomplete
 */

(function($){
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.grp_autocomplete_fk.defaults, options);
            return this.each(function() {
                var $this = $(this);
                // remove djangos object representation (if given)
                if ($this.next().next() && $this.next().next().attr("class") != "errorlist") $this.next().next().remove();
                // build remove link
                $this.next().after(remove_link($this.attr('id')));
                // build autocomplete wrapper
                $this.parent().wrapInner("<div class='autocomplete-wrapper-fk'></div>");
                $this.parent().prepend("<input id='" + $this.attr("id") + "-autocomplete' type='text' class='vTextField' value='' />");
                // extend options
                options = $.extend({
                    wrapper_autocomplete: $this.parent(),
                    input_field: $this.prev(),
                    remove_link: $this.next().next().hide()
                }, $.fn.grp_autocomplete_fk.defaults, options);
                // lookup
                lookup_id($this, options); // lookup when loading page
                lookup_autocomplete($this, options); // autocomplete-handler
                $this.bind("change focus keyup blur", function() { // id-handler
                    lookup_id($this, options);
                });
                // labels
                $("label[for='"+$this.attr('id')+"']").each(function() {
                    $(this).attr("for", $this.attr("id")+"-autocomplete");
                });
            });
        }
    };
    
    $.fn.grp_autocomplete_fk = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.grp_autocomplete_fk');
        };
        return false;
    };
    
    var remove_link = function(id) {
        var removelink = $('<a class="related-remove"></a>');
        removelink.attr('id', 'remove_'+id);
        removelink.attr('href', 'javascript://');
        removelink.attr('onClick', 'return removeRelatedObject(this);');
        removelink.hover(function() {
            $(this).parent().toggleClass("autocomplete-preremove");
        });
        return removelink;
    };
    
    var lookup_autocomplete = function(elem, options) {
        options.wrapper_autocomplete.find("input:first")
            .bind("focus", function() { // reset term (hack!)
                $(this).data("autocomplete").term = "";
            })
            .autocomplete({
                minLength: 1,
                source: function(request, response) {
                    $.getJSON(options.autocomplete_lookup_url, {
                        term: request.term,
                        app_label: grappelli.get_app_label(elem),
                        model_name: grappelli.get_model_name(elem)
                    }, function(data) {
                        response($.map(data, function(item) {
                            return {label: item.label, value: item.value};
                        }));
                    });
                },
                select: function(event, ui) {
                    options.input_field.val(ui.item.label);
                    elem.val(ui.item.value);
                    elem.val() ? $(options.remove_link).show() : $(options.remove_link).hide();
                    return false;
                }
            })
            .data("autocomplete")._renderItem = function(ul,item) {
                var label = item.value ? "<a>" + item.label + "</a>" : "<span>" + item.label + "</span>";
                return $("<li></li>").data("item.autocomplete", item).append(label).appendTo(ul);
            };
    };
    
    var lookup_id = function(elem, options) {
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: grappelli.get_app_label(elem),
            model_name: grappelli.get_model_name(elem)
        }, function(data) {
            $.each(data, function(index) {
                options.input_field.val(data[index].label);
                elem.val() ? $(options.remove_link).show() : $(options.remove_link).hide();
            });
        });
    };
    
    $.fn.grp_autocomplete_fk.defaults = {
        autocomplete_lookup_url: '',
        lookup_url: ''
    };
    
})(django.jQuery);