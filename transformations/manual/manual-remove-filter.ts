import wrap from '../../src/wrapAstTransformation'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import { pushManualList } from '../../src/report'

export const transformAST: ASTTransformation = context => {
  const { root, j, filename } = context

  const rootNodes: any = root
    .find(j.Identifier, {
      name: 'filters'
    })
    // Exclude when the parent node is named "props"
    .filter((node: any) => node?.parent?.parent?.parentPath?.value?.key?.name !== 'props')
    .filter((node: any) => node?.parent?.parent?.parentPath?.value?.type !== 'ReturnStatement')
    // this.filters is safe
    .filter((node: any) => node?.parent?.value?.object?.type !== 'ThisExpression')
    // Exclude when filters is the name of a ObjectMethod argument
    .filter((node: any) => node?.parent?.value?.type !== 'ObjectMethod')
    // Must be chained like $options.filters
    .filter((node: any) => (node?.parent?.value?.type === "MemberExpression"
      && node?.parentPath?.node?.object?.property?.name === "$options") || node?.parent?.value?.type !== "MemberExpression"
    )
    // Exclude variable declarations (VariableDeclarator)
    .filter((node: any) => node?.parent?.value?.type !== 'VariableDeclarator')
    // Exclude AssignmentExpression
    .filter((node: any) => node?.parent?.value?.type !== 'AssignmentExpression')
    // Exclude CallExpression
    .filter((node: any) => node?.parent?.value?.type !== 'CallExpression')
    // Exclude ObjectProperty
    .filter((node: any) => node?.parent?.value?.type !== 'ObjectProperty')
    .filter((node: any) => node?.value.property?.name !== 'createApp')
  if (rootNodes) {
    rootNodes.forEach((node: any) => {
      debugger;
      const path = filename
      const name = 'Removed Filters'
      const suggest =
        'Filters are removed from Vue 3.0 and no longer supported.'
      const website =
        'https://v3-migration.vuejs.org/breaking-changes/filters.html#overview'
      pushManualList(path, node, name, suggest, website)
    })
  }

  const rootNodes2: any = root.find(j.MemberExpression, {
    object: {
      name: 'Vue'
    },
    property: {
      name: 'filter'
    }
  })
  if (rootNodes2) {
    rootNodes2.forEach((node: any) => {
      const path = filename
      const name = 'remove global filters'
      const suggest =
        'Instead, you can make your global filters available to all components through globalProperties: '
      const website =
        'https://v3-migration.vuejs.org/breaking-changes/filters.html#global-filters'
      pushManualList(path, node, name, suggest, website)
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
