var REQUIRED_FIELDS = {
    c_AgileTODO1: '',
    c_AgileWIP1: '',
    c_AgileDONE1: '',
    c_AgileTODO2: '',
    c_AgileWIP2: '',
    c_AgileDONE2: '',
    c_AgileTODO3: '',
    c_AgileWIP3: '',
    c_AgileDONE3: '',
    c_AgileTODO4: '',
    c_AgileWIP4: '',
    c_AgileDONE4: '',
};

const title1 = 'A Acquerir';
const title2 = 'En cours d acquisition';
const title3 = 'Acquises';

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
      //this.callParent(arguments);

      this.add({
          xtype: 'container',
          itemId: 'content',
          layout: 'column',
          width: screen.width,
          title: 'Agile Fondamentale (focus valeur)'
      });

      Rally.data.wsapi.ModelFactory.getModels({
          context: this.getContext(),
          types: 'Project',
          success: function(models) {
              this.models = models;
              this._loadProject();
          },
          scope: this
      });

    },

    _loadProject: function(){
      var id = this.getContext().getProject().ObjectID;
      this.models.Project.load(id, {
            fetch: _.keys(REQUIRED_FIELDS)
        }).then({
            success: function(project) {
              this.project = project;
              this._checkForFields();
            },
            scope: this
      });
    },

    _checkForFields: function() {
        var contentContainer = this.down('#content');
        contentContainer.removeAll();
        if (!_.every(_.keys(REQUIRED_FIELDS), this._fieldExists, this)) {
            var isWorkspaceAdmin = this.getContext().getPermissions().isWorkspaceOrSubscriptionAdmin(this.getContext().getWorkspace());
            contentContainer.add({
                itemId: 'missingFieldsBlankSlate',
                xtype: 'container',
                cls: 'no-data-container',
                items: [
                    {
                        xtype: 'component',
                        cls: 'primary-message',
                        html: 'One or more required Iteration custom fields are missing.'
                    },
                    {
                        xtype: 'component',
                        cls: 'secondary-message',
                        html: 'This app uses custom fields on Iteration to store retro pluses, deltas and action items.'
                    },
                    {
                        xtype: 'component',
                        cls: 'secondary-message',
                        html: isWorkspaceAdmin ?
                          'Click <a href="#" class="create-fields-link">here</a> to create these fields.' :
                          'Please contact a workspace administrator to set up these fields using this app.',
                        listeners: {
                            afterrender: function(cmp) {
                                var linkEl = cmp.getEl().down('.create-fields-link');
                                this.mon(linkEl, 'click', this._createRequiredFields, this);
                            },
                            scope: this
                        }
                    }
                ]
            });
        } else {
            contentContainer.add([
                {
                    xtype: 'panel',
                    cls: 'fondamentale-panel',
                    title: 'AGILE FONDAMENTALE',
                    titleAlign: 'center',
                    columnWidth: 0.5,
                    minWidth: 550,
                    items: [this._buildEditorFor(title1,'c_AgileTODO1'), this._buildEditorFor(title2,'c_AgileWIP1'), this._buildEditorFor(title3,'c_AgileDONE1')]
                },
                {
                    xtype: 'panel',
                    cls: 'durable-panel',
                    title: 'AGILE DURABLE',
                    titleAlign: 'center',
                    columnWidth: 0.5,
                    minWidth: 550,
                    items: [this._buildEditorFor(title1,'c_AgileTODO2'), this._buildEditorFor(title2,'c_AgileWIP2'), this._buildEditorFor(title3,'c_AgileDONE2')]
                },
                {
                    xtype: 'panel',
                    cls: 'promesse-panel',
                    title: 'PROMESSE DE L AGILE',
                    columnWidth: 0.5,
                    titleAlign: 'center',
                    minWidth: 550,
                    items: [this._buildEditorFor(title1,'c_AgileTODO3'), this._buildEditorFor(title2,'c_AgileWIP3'), this._buildEditorFor(title3,'c_AgileDONE3')]
                },
                {
                    xtype: 'panel',
                    cls: 'future-panel',
                    title: 'FUTURE DE L AGILE',
                    columnWidth: 0.5,
                    titleAlign: 'center',
                    minWidth: 550,
                    items: [this._buildEditorFor(title1,'c_AgileTODO4'), this._buildEditorFor(title2,'c_AgileWIP4'), this._buildEditorFor(title3,'c_AgileDONE4')]
                }
            ]);
          }
      },

      _fieldExists: function(name) {
        return !!_.find(this.models.Project.getFields(), function(field) {
            return field.isCustom() && field.getType() === 'text' && field.name === name;
        });
      },

      _buildEditorFor: function(title, fieldName) {
        return {
          xtype: 'panel',
          cls: 'child-panel',
          title: title,
          titleAlign: 'center',
          margin: '0px 10px',
          height: 250,
          items: [
            {
              xtype: 'rallyrichtexteditor',
              itemId: fieldName.replace('c_A', 'a'),
              fieldName: fieldName,
              showUndoButton: true,
              height: 200,
              value: this.project.get(fieldName),
              listeners: {
                  blur: this._onEditorChange,
                  scope: this
                }
            }
          ]
        };
      },

      _onEditorChange: function(editor) {
        this.project.set(editor.fieldName, editor.getValue());
        this.project.save({
            fetch: _.keys(REQUIRED_FIELDS)
        }).then({
            success: function(project) {
                this.project = project;
                Ext.create('Rally.ui.detail.view.SavedIndicator', {
                    target: editor
                });
            },
            scope: this
        });
      }

});
