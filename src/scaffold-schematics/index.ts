import { Rule, SchematicContext, Tree, chain, noop, apply, url, applyTemplates, mergeWith, renameTemplateFiles, move, filter } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';

import { ModuleOptions } from './schema';

function createAtomicDesignPatternFolders(options: ModuleOptions): Rule {
  return (tree: Tree, _: SchematicContext) => {
    tree.create(normalize(`${options.name}/components/atoms/.gitkeep`), '');
    tree.create(normalize(`${options.name}/components/molecules/.gitkeep`), '');
    tree.create(normalize(`${options.name}/components/organisms/.gitkeep`), '');
    tree.create(normalize(`${options.name}/components/pages/.gitkeep`), '');

    return tree;
  };
}

function createComponentsModuleFileDefinition(options: ModuleOptions): Rule {
  const templateSource = apply(url('./files'), [
    filter(path => path.endsWith('/components.module.ts.template')),
    applyTemplates({
      ...strings,
      ...options
    }),
    renameTemplateFiles(),
    move(normalize(`${options.name}/components`))
  ]);

  return mergeWith(templateSource);
}

function executeComponentsTasks(options: ModuleOptions): Rule {
  return chain([
    createAtomicDesignPatternFolders(options),
    createComponentsModuleFileDefinition(options)
  ])
}

function createDataRelatedFolders(options: ModuleOptions): Rule {
  return (tree: Tree, _: SchematicContext) => {
    tree.create(normalize(`${options.name}/data/models/.gitkeep`), '');
    tree.create(normalize(`${options.name}/data/services/.gitkeep`), '');

    return tree;
  };
}

function createStoreFolder(options: ModuleOptions): Rule {
  return (tree: Tree, _: SchematicContext) => {
    tree.create(normalize(`${options.name}/data/store/.gitkeep`), '');

    return tree;
  };
}

function createMainModuleFileDefinition(options: ModuleOptions): Rule {
  const templateSource = apply(url('./files'), [
    filter(path => path.endsWith('__name@dasherize__.module.ts.template')),
    applyTemplates({
      ...strings,
      ...options
    }),
    renameTemplateFiles(),
    move(normalize(`${options.name}/`))
  ]);

  return mergeWith(templateSource);
}

export function scaffoldSchematics(options: ModuleOptions): Rule {
  return chain([
    executeComponentsTasks(options),
    createDataRelatedFolders(options),
    options.useStore ? createStoreFolder(options) : noop(),
    createMainModuleFileDefinition(options)
  ]);
}
