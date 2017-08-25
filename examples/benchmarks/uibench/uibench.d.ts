interface HomeState { }

interface TableItemState {
  id: number;
  active: boolean;
  props: string[];
}

interface TableState {
  items: TableItemState[];
}

interface AnimBoxState {
  id: number;
  time: number;
}

interface AnimState {
  items: AnimBoxState[];
}

interface TreeNodeState {
  id: number;
  container: boolean;
  children: TreeNodeState[];
}

interface TreeState {
  root: TreeNodeState;
}

interface AppState {
  location: string;
  home: HomeState;
  table: TableState;
  anim: AnimState;
  tree: TreeState;
}

interface UIBench {
  init(name: string, version: string): void;
  run(update: (state: AppState) => void, finish: (samples: any) => void): void;
}

declare var uibench: UIBench;
