var path = require('path')


module.exports = {
  fileTypes: ['.c', '.cpp'],

  fileSupported: function(file) {
    var ext = path.extname(file)
    return !!~this.fileTypes.indexOf(ext)
  },

  activate: function () {
    this.commands = atom.commands.add('atom-workspace', 'gorobot-formatter:format', function () {
      this.format()
    }.bind(this))

    this.editorObserver = atom.workspace.observeTextEditors(this.handleEvents.bind(this))
  },

  deactivate: function () {
    this.commands.dispose()
    this.editorObserver.dispose()
  },

  format: function(options) {
    if (options === undefined) {
      options = {}
    }

    var selection = typeof options.selection === 'undefined' ? true : !!options.selection

    var editor = atom.workspace.getActiveTextEditor()

    if(!editor) return

    var selectedText = selection ? editor.getSelectedText() : null
    var text = selectedText || editor.getText()

    var cursorPosition = editor.getCursorScreenPosition()

    var language = editor.getGrammar().name

    this.transformText(text, function (e, transformed) {
      if(e) {
        console.log('Error transforming text:', e)
        transformed = text
      }

      if (selectedText) {
        editor.setTextInBufferRange(editor.getSelectedBufferRange(), transformed)
      } else {
        editor.setText(transformed)
      }

      editor.setCursorScreenPosition(cursorPosition)
    })
  },

  transformText: function(text, cb) {
    console.log('transforming text')
    cb(null, text)
  },

  handleEvents: function(editor) {
    editor.getBuffer().onWillSave(function () {
      var path = editor.getPath()
      if (!path) return

      if (!editor.getBuffer().isModified()) return

      var formatOnSave = atom.config.get('gorobot-formatter.formatOnSave', {scope: editor.getRootScopeDescriptor()})
      if (!formatOnSave) return

      var relativePath = path
      if (this.fileSupported(relativePath)) {
        this.format({selection: false})
      }
    }.bind(this))
  },

  config: {
    formatOnSave: {
      type: 'boolean',
      default: false
    }
  }
}
