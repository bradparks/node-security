import Module from 'module';
import Errors from './Errors';

class ModuleLoader {
  constructor( config ) {
    this.config = config;

    /**
     * Store an instance of the original Module._load
     * functionality.
     **/
    this.originalLoad = Module._load;

    /**
     * Store an instance of the original process.binding
     * functionality.
     */
    this.originalBinding = process.binding;

    /**
     * Store an instance of the original process._linkedBinding
     * functionality.
     */
    this.originalLinkedBinding = process._linkedBinding;
  }

  getOriginalLoader = () => {
    return this.originalLoad;
  }

  getOriginalBinding = () => {
    return this.originalBinding;
  }

  getOriginalLinkedBinding = () => {
    return this.originalLinkedBinding;
  }

  /* Determines whether this module was loaded by a parent module */
  findParentModules( parent ) {
    let parents = [];
    let currentModule = parent;

    /* Recursively walk up the parent tree, creating a list of parents */
    while ( currentModule ) {
      parents.push( currentModule.filename );
      currentModule = currentModule.parent;
    }

    return parents;
  }

  isModuleAllowed( request, parent ) {
    /* Determine the friendly module name of the parent module */
    const parentModules = this.findParentModules( parent );

    /**
     * Loop over the parent modules, checking whether any of them specify
     * individual module permissions. Keep in mind that individual module
     * permissions will always override any core / global preferences.
     * */
    for ( let i = 0; i < parentModules.length; i++ ) {
      const parentModule = parentModules[i];

      /* Check whether config was provided for this module */
      if ( this.config.module[ parentModule ] != null ) {
        /* Config was provided, merge the config with the core config */
        const moduleConfig = this.config.module[parentModule];

        if ( moduleConfig[ request ] != null ) {
          return moduleConfig[ request ];
        }
      }
    }

    /* Check whether we've blocked access to this module */
    if ( this.config.core[ request ] != null && this.config.core[ request ] === false ) {
      return false;
    }

    return true;
  }

  isBindingAllowed( request ) {
    /* Check whether we've blocked access to this module */
    if ( this.config.core[ request ] != null && this.config.core[ request ] === false ) {
      return false;
    }

    return true;
  }

  /* Called when a module is attempted to be loaded */
  load = ( request, parent, isMain ) => {
    /* Check whether loading this module is allowed */
    const allowedToLoad = this.isModuleAllowed( request, parent );

    /* If not allowed to load then throw an error */
    if ( !allowedToLoad ) {
      /* Get parent tree */
      const parents = this.findParentModules( parent );
      throw new Error( Errors.ERROR_NOT_ALLOWED_TO_LOAD( request, parents ));
    }

    const module = this.originalLoad( request, parent, isMain );

    return module;
  }

  /* Called when a binding is attempted to be loaded */
  binding = ( request ) => {
    if ( !this.isBindingAllowed( request )) {
      throw new Error( Errors.ERROR_NOT_ALLOWED_TO_LOAD( request ));
    }

    return this.originalBinding( request );
  }

  /* Called when a linked binding is attempted to be loaded */
  linkedBinding = ( request ) => {
    if ( !this.isBindingAllowed( request )) {
      throw new Error( Errors.ERROR_NOT_ALLOWED_TO_LOAD( request ));
    }

    return this.originalLinkedBinding( request );
  }
};

export default ModuleLoader;

/* Prevent the prototype being modified */
Object.freeze( module.exports.default.prototype );