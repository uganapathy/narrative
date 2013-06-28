/*


*/

(function( $, undefined ) {


    $.kbWidget("kbaseIrisFileBrowser", 'kbaseDataBrowser', {
        version: "1.0.0",
        options: {
            title : 'File Browser',
            'root' : '/',
            types : {
                file : {
                    controls :
                    [
                        {
                            icon : 'icon-remove',
                            callback : function(e) {
                                console.log("clicked on delete");
                                console.log($(this).parent().parent());
                                console.log($(this).parent().parent().data('id'));
                            },
                            id : 'removeButton',
                            //tooltip : 'Delete this file',
                        },
                        {
                            icon : 'icon-eye-open',
                            callback : function(e) {
                                console.log("clicked on view");
                                console.log($(this).parent().parent().data('id'));
                            },
                            id : 'viewButton'
                        },
                        {
                            icon : 'icon-arrow-right',
                            callback : function(e) {
                                console.log("clicked on add to term");
                                console.log($(this).parent().parent().data('id'));
                            },
                            id : 'addButton'
                        },
                    ],
                },
                folder : {
                    childrenCallback : function (val, callback) {
                        console.log("ON " + val.id);
                        this.listDirectory(val.id, function (results) {
                            callback(results);
                        });
                    },
                    controls : [
                        {
                            icon : 'icon-remove',
                            callback : function(e) {
                                console.log("clicked on delete dir");
                                console.log($(this).parent().parent().data('id'));
                            },
                            id : 'removeDirectoryButton'
                        },
                        {
                            icon : 'icon-plus',
                            callback : function(e) {
                                console.log("clicked on add sub");
                                console.log($(this).parent().parent().data('id'));
                            },
                            id : 'addDirectoryButton'
                        },
                    ],
                }
            },
        },

        init: function (options) {

            if (options.client) {
                this.client = options.client;
            }

            if (options.$loginbox) {
                this.$loginbox = options.$loginbox;
            }

            var $pc = $('<div></div>').css('margin-top', '2px')
            $pc.kbaseButtonControls(
                {
                    onMouseover : false,
                    controls : [
                        {
                            'icon' : 'icon-plus',
                            'tooltip' : 'add directory'
                        },
                        {
                            'icon' : 'icon-arrow-up',
                            'tooltip' : 'upload a file'
                        },
                    ]

                }
            );

            this.options.postcontent = $pc;

            this._super(options);

            this.listDirectory(this.options.root, $.proxy(function (results) {
                this.appendContent(results, this.data('ul-nav'))
            }, this));

            return this;

        },

        sessionId : function() {
            return this.$loginbox.sessionId();
        },

        listDirectory : function (path, callback) {

console.log(this.$loginbox.sessionId());
console.log(path);
            this.client.list_files(
                this.sessionId(),
                '/',
                path,
                jQuery.proxy( function (filelist) {
                    var dirs = filelist[0];
                    var files = filelist[1];
console.log(filelist);
                    var results = [];

                    var $fb = this;
                    jQuery.each(
                        dirs.sort(this.sortByKey('name')),
                        $.proxy(function (idx, val) {
                            val['full_path'] = val['full_path'].replace(/\/+/g, '/');
                            results.push(
                                {
                                    'type' : 'folder',
                                    'id' : val['full_path'],
                                    'label' : val['name'],
                                }
                            )
                        }, this)
                    );

                    jQuery.each(
                        files.sort(this.sortByKey('name')),
                        $.proxy(function (idx, val) {
                            val['full_path'] = val['full_path'].replace(/\/+/g, '/');

                            results.push(
                                {
                                    'type' : 'file',
                                    'id' : val['full_path'],
                                    'label' : val['name'],
                                }
                            )
                        }, this)
                    );
                    console.log("RESULTS");console.log(results);
                    results = results.sort(this.sortByKey('label'));

                    callback(results);

                    }, this
                ),
                $.proxy(function (err) {this.dbg(err)},this)
            );

        },

/*
        refreshDirectory : function(path) {

            if (this.sessionId() == undefined) {
                this.$elem.find('ul').first().empty();
            }

            if (this.data(path)) {
                this.listDirectory(path, this.data(path));
            }
        },


        init: function (options) {
            if (options.$terminal) {
                this.$terminal = options.$terminal;
            }

            this._super(options);

            return this;

        },

        listDirectory : function (path, $ul) {

            this.data(path, $ul);

            this.client.list_files(
                this.sessionId(),
                '/',
                path,
                jQuery.proxy( function (filelist) {
                    var dirs = filelist[0];
                    var files = filelist[1];

                    var $fb = this;

                    $ul.empty();

                    jQuery.each(
                        dirs.sort(this.sortByName),
                        $.proxy(function (idx, val) {

                            val['full_path'] = val['full_path'].replace(/\/+/g, '/');

                            $ul.append(
                                $('<li></li>')
                                    .append(
                                        $('<a></a>')
                                            .append(
                                                $('<i></i>')
                                                    .addClass(this.data(val['full_path']) ? $fb.options.openFolderIcon : $fb.options.closedFolderIcon)
                                                    .css('color', 'gray')
                                            )
                                            .append(' ')
                                            .append(val['name'])
                                            .attr('href', '#')
                                            .bind('click',
                                                function(e) {
                                                    e.preventDefault();
                                                    $fb.data('activeDirectory', undefined);
                                                    $fb.data('activeFile', undefined);
                                                    $fb.viewButton().addClass('disabled');
                                                    $fb.deleteButton().addClass('disabled');

                                                    var $opened = $fb.$elem.find('.active');
                                                    $opened.removeClass('active');

                                                    //has children? It's opened. Close it.
                                                    if ($(this).next().children().length) {
                                                        //shut it if it's active. Otherwise, make it active
                                                        if ($(this).parent().get(0) == $opened.get(0)) {
                                                            $(this).children().first().removeClass($fb.options.openFolderIcon);
                                                            $(this).children().first().addClass($fb.options.closedFolderIcon);
                                                            $(this).next().empty();
                                                            $fb.data(val['full_path'], undefined);
                                                        }
                                                        else {
                                                            $fb.data('activeDirectory', val['full_path']);
                                                            $(this).parent().addClass('active');
                                                            $fb.deleteButton().removeClass('disabled');
                                                        }

                                                    }
                                                    //no children? it's closed. open it.
                                                    else {
                                                        $(this).children().first().removeClass($fb.options.closedFolderIcon);
                                                        $(this).children().first().addClass($fb.options.openFolderIcon);
                                                        $fb.listDirectory(val['full_path'], $(this).next());
                                                        $(this).parent().addClass('active');
                                                        $fb.data('activeDirectory', val['full_path']);
                                                        $fb.deleteButton().removeClass('disabled');
                                                    }
                                                }
                                            )
                                    )
                                    .append($('<ul></ul>').addClass('nav nav-list'))
                            );

                            if (this.data(val['full_path'])) {
                                this.listDirectory(val['full_path'], $ul.children().last().children().last());
                            }
                        }, this)
                    );
                    jQuery.each(
                        files.sort(this.sortByName),
                        $.proxy(function (idx, val) {

                            val['full_path'] = val['full_path'].replace(/\/+/g, '/');

                            $ul.append(
                                $('<li></li>')
                                    .append(
                                        $('<a></a>')
                                            .append(
                                                $('<i></i>')
                                                    .addClass(this.options.fileIcon)
                                                    .css('color', 'gray')
                                            )
                                            .append(' ')
                                            .append(val['name'])
                                            .attr('href', '#')
                                            .bind('click',
                                                function(e) {
                                                    e.preventDefault();
                                                    $fb.data('activeDirectory', undefined);
                                                    $fb.data('activeFile', undefined);
                                                    $fb.viewButton().addClass('disabled');
                                                    $fb.deleteButton().addClass('disabled');
                                                    var $opened = $fb.$elem.find('.active');
                                                    $opened.removeClass('active');
                                                    if ($(this).parent().get(0) != $opened.get(0)) {
                                                        $(this).parent().addClass('active');
                                                        $fb.data('activeFile', val['full_path']);
                                                        $fb.viewButton().removeClass('disabled');
                                                        $fb.deleteButton().removeClass('disabled');

                                                    }
                                                }
                                            )
                                    )
                            );
                        },this)
                    );

                    }, this
                ),
                $.proxy(function (err) {this.dbg(err)},this)
            );

        },

        appendUI : function($elem) {

            var $div = $('<div></div>')
                .css('border', '1px solid lightgray')
                .css('padding', '2px')
                .append(
                    $('<h5></h5>')
                        .addClass('text-left')
                        .text("File Browser")
                        .css('margin', '0px')
                        .css('padding', '2px')
                        .css('background-color', 'lightgray')
                        .css('border-collapse', 'collapse')
                        .bind('click',
                            function(e) {
                                $(this).next().collapse('toggle');
                            }
                        )
                    )
            ;

            var navHeight = this.options.height;

            var $ul = $('<ul></ul>')
                .addClass('nav nav-list')
                .css('height', navHeight)
                .css('overflow', 'auto')
                .attr('id', 'ul-nav')
            ;
            var $controls =
                $('<div></div>')
                    .addClass('btn-toolbar')
                    .addClass('text-right')
                    .append(
                        $('<div></div>')
                            .addClass('btn-group')
                            .attr('id', 'control-buttons')
                            .append(
                                $('<input></input>')
                                    .attr('type', 'file')
                                    .attr('id', 'fileInput')
                                    .css('display', 'none')
                                    .bind( 'change', jQuery.proxy(this.handleFileSelect, this) )
                            )
                    )
            ;

            var $container =
                $('<div></div>')
                    .append($ul);

            $div.append($container);
            $elem.append($div);

            if (this.options.controls) {
                if (this.options.externalControls) {
                    $div.append($controls);
                }
                else {
                    $container.append($controls);
                }
            }

            this._rewireIds($div, this);

            $.each(
                this.options.controlButtons,
                $.proxy( function (idx, val) {
                    this.data('control-buttons').append(
                        this[val]()
                    );
                }, this)
            );

            this._rewireIds($div, this);

            this.listDirectory(this.options.root, $ul);

            return this;

        },

        addDirectoryButton : function() {
            return this.data('addDirectoryButton') != undefined
                ? this.data('addDirectoryButton')
                : $('<a></a>')
                    .attr('id', 'addDirectoryButton')
                    .addClass('btn btn-mini')
                    .append($('<i></i>').addClass('icon-plus'))
                    .attr('title', 'Add new directory')
                    .tooltip()
                    .bind('click',
                        $.proxy( function(e) {
                            e.preventDefault();
                            if (! this.addDirectoryButton().hasClass('disabled')) {
                                this.addDirectory();
                            }
                        }, this)
                    )
        },

        viewButton : function() {
            return this.data('viewButton') != undefined
                ? this.data('viewButton')
                : $('<a></a>')
                    .attr('id', 'viewButton')
                    .addClass('btn btn-mini disabled')
                    .append($('<i></i>').addClass('icon-search'))
                    .attr('title', 'View selected file')
                    .tooltip()
                    .bind('click',
                        $.proxy( function(e) {
                            e.preventDefault();
                            if (! this.viewButton().hasClass('disabled')) {
                                this.openFile(this.data('activeFile'));
                            }
                        }, this)
                    )
        },

        deleteButton : function() {
            return this.data('deleteButton') != undefined
                ? this.data('deleteButton')
                : $('<a></a>')
                    .attr('id', 'deleteButton')
                    .addClass('btn btn-mini disabled')
                    .append($('<i></i>').addClass('icon-remove'))
                    .attr('title', 'Delete selected item')
                    .tooltip()
                    .bind('click',
                        $.proxy( function(e) {
                            e.preventDefault();
                            if (! this.deleteButton().hasClass('disabled')) {
                                this.deleteFile();
                            }
                        }, this)
                    )
        },

        uploadButton : function() {
            return this.data('uploadButton') != undefined
                ? this.data('uploadButton')
                : $('<a></a>')
                    .attr('id', 'uploadButton')
                    .addClass('btn btn-mini')
                    .append($('<i></i>').addClass('icon-arrow-up'))
                    .attr('title', 'Upload file')
                    .tooltip()
                    .bind('click',
                        $.proxy( function (e) {
                            this.data('fileInput').trigger('click');
                        }, this)
                    )
        },

        addDirectory : function() {
            var parentDir = this.data('activeDirectory') || this.options.root;
            var that = this;

            var displayDir = parentDir.replace(this.options.root, '/');

            var $addDirectoryModal = $('<div></div>').kbasePrompt(
                {
                    title : 'Create directory',
                    body : $('<p></p>')
                            .append('Create directory ')
                            .append(
                                $('<span></span>')
                                    .css('font-weight', 'bold')
                                    .text(displayDir)
                            )
                            .append(' ')
                            .append(
                                $('<input></input>')
                                    .attr('type', 'text')
                                    .attr('name', 'dir_name')
                                    .attr('size', '20')
                            )
                    ,
                    controls : [
                        'cancelButton',
                        {
                            name : 'Create directory',
                            type : 'primary',
                            callback : function(e, $prompt) {
                                $prompt.closePrompt();
                                that.client.make_directory(
                                    that.sessionId,
                                    parentDir,
                                    $addDirectoryModal.dialogModal().find('input').val(),
                                    function (res) { that.refreshDirectory(parentDir) },
                                    function() {}
                                    );
                            }
                        }
                    ]
                }
            );

            $addDirectoryModal.openPrompt();


        },

        openFile : function(file) {

            // can't open the window in trhe callback!
            var win = window.open();
            win.document.open();

            this.client.get_file(
                this.sessionId(),
                file,
                '/',
                $.proxy(
                    function (res) {

                        try {
                            var obj = JSON.parse(res);
                            res = JSON.stringify(obj, undefined, 2);
                        }
                        catch(e) {
                            this.dbg("FAILURE");
                            this.dbg(e);
                        }

                        win.document.write(
                            $('<div></div>').append(
                                $('<div></div>')
                                    .css('white-space', 'pre')
                                    .append(res)
                            )
                            .html()
                        );
                        win.document.close();

                    },
                    this
                ),
                function (err) { this.dbg("FILE FAILURE"); this.dbg(err) }
            );
        },

        deleteFile : function() {

            var file = this.data('activeFile');
            var deleteMethod = 'remove_files';

            if (file == undefined) {
                file = this.data('activeDirectory');

                if (file == undefined) {
                    return;
                }

                file = file.replace(/\/+$/, '');
                deleteMethod = 'remove_directory';

            }
            var matches = file.match(/(.+)\/[^/]+$/);

            var active_dir = '/';
            if (matches != undefined && matches.length > 1) {
                active_dir = matches[1];
            }

            var that = this; //sigh. The confirm button needs it for now.

            var promptFile = file.replace(this.options.root, '');

            var $deleteModal = $('<div></div>').kbaseDeletePrompt(
                {
                    name : promptFile,
                    callback : function(e, $prompt) {
                        $prompt.closePrompt();
                        that.client[deleteMethod](
                            that.sessionId,
                            '/',
                            file,
                            function (res) { that.refreshDirectory(active_dir) },
                            function() {}
                            );
                    }
                }
            );

            $deleteModal.openPrompt();

        },

        handleFileSelect : function(evt) {

            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.target.files
                || evt.originalEvent.dataTransfer.files
                || evt.dataTransfer.files;

            $.each(
                files,
                jQuery.proxy(
                    function (idx, file) {

                        var reader = new FileReader();

                        var upload_dir = '/';
                        if (this.data('activeDirectory')) {
                            upload_dir = this.data('activeDirectory');
                        }


                        var $processElem;

                        if (this.options.processList) {
                            $processElem = this.options.processList.addProcess('Uploading ' + file.name);
                        }

                        reader.onload = jQuery.proxy(
                            function(e) {

                                this.client.put_file(
                                    this.sessionId(),
                                    file.name,
                                    e.target.result,
                                    upload_dir,
                                    jQuery.proxy( function (res) {
                                        if (this.options.processList) {
                                            this.options.processList.removeProcess($processElem);
                                        }
                                        this.refreshDirectory(upload_dir)
                                    }, this),
                                    jQuery.proxy( function (res) {
                                        if (this.options.processList) {
                                            this.options.processList.removeProcess($processElem);
                                        }
                                        this.dbg(res);
                                    }, this)
                                );
                            },
                            this
                        );

                        reader.readAsText(file);

                    },
                    this
                )
            );

            this.data('fileInput').val('');

        }
*/
    });

}( jQuery ) );
