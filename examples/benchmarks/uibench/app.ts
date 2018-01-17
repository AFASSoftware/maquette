/* tslint:disable no-console */
import { MaquetteComponent, VNode } from '../../../src/interfaces';
import { h } from '../../../src/h';
import { createMapping } from '../../../src/mapping';
import { dom } from '../../../src/dom';

const version = '3.0';

let createTableCell = (text: string): MaquetteComponent => {
  let handleClick = (evt: MouseEvent) => {
    console.log('Click', { text });
  };

  return {
    render: () => {
      return h('td.TableCell', { key: text, onclick: handleClick }, [text]);
    }
  };
};

interface TableRow extends MaquetteComponent {
  update(state: TableItemState): void;
}

let createTableRow = (state: TableItemState): TableRow => {
  let firstCell = createTableCell(`#${state.id}`);
  let mapping = createMapping<string, MaquetteComponent>(text => text, createTableCell, () => undefined);
  mapping.map(state.props);
  return {
    update: (newState) => {
      mapping.map(newState.props);
    },
    render: () => {
      return h('tr.TableRow', { 'data-id': `${state.id}`, key: state.id, classes: { active: state.active } }, [
        firstCell.render(),
        mapping.results.map(cell => cell.render())
      ]);
    }
  };
};

interface Table extends MaquetteComponent {
  update(state: TableState): void;
}

let createTable = (state: TableState): Table => {
  let mapping = createMapping<TableItemState, TableRow>(itemState => itemState.id, createTableRow, (source, target) => target.update(source));
  mapping.map(state.items);
  return {
    update: (newState: TableState) => {
      state = newState;
      mapping.map(newState.items);
    },
    render: () => {
      return h('table.Table', [h('tbody', mapping.results.map(row => row.render()))]);
    }
  };
};

let renderAnimBox = (state: AnimBoxState): VNode => {
  const time = state.time;
  return h('div.AnimBox', {
    'data-id': `${state.id}`,
    styles: {
      background: `rgba(0,0,0,${0.5 + ((time % 10) / 10)})`,
      borderRadius: `${time % 10}px`
    }
  });
};

let renderAnim = (state: AnimState): VNode => {
  const items = state.items;
  return h('div.Anim', items.map(item => renderAnimBox(item)));
};

let renderTreeLeaf = (state: TreeNodeState): VNode => {
  return h('li.TreeLeaf', { key: state.id }, [`${state.id}`]);
};

let renderTreeNode = (state: TreeNodeState): VNode => {
  return h('ul.TreeNode', { key: state.id }, state.children.map(child => {
    if (child.container) {
      return renderTreeNode(child);
    } else {
      return renderTreeLeaf(child);
    }
  }));
};

let renderTree = (state: TreeState): VNode => {
  return h('div.Tree', [renderTreeNode(state.root)]);
};

let createMain = (state: AppState | null) => {
  let table: Table | undefined;
  let updateTable = () => {
    if (!state || state.location !== 'table') {
      table = undefined;
    } else {
      if (table) {
        table.update(state.table);
      } else {
        table = createTable(state.table);
      }
    }
  };
  updateTable();
  return {
    update: (newState: AppState) => {
      state = newState;
      updateTable();
    },
    render: () => {
      let children: (VNode | null | undefined)[] | undefined;
      if (state) {
        switch (state.location) {
          case 'table':
            children = [table!.render()];
            break;
          case 'anim':
            children = [renderAnim(state.anim)];
            break;
          default: // 'tree'
            children = [renderTree(state.tree)];
            break;
        }
      }
      return h('div.Main', children);
    }
  };
};

document.title = version;

uibench.init('Maquette', version);

let main = createMain(null);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#App')!;

  let projection = dom.append(container, main.render(), {});

  uibench.run(
    (state) => {
      main.update(state);
      projection.update(main.render());
    },
    (samples) => {
      projection.domNode.remove();

      dom.append(container, h('pre', [JSON.stringify(samples, undefined, 2)]));
    }
  );
});
