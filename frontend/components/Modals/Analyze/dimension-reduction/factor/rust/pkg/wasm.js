/* This is a stub WASM module. The real WASM binary needs to be compiled using wasm-pack. */

let wasm;

const heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap.pop();
}

function addHeapObject(obj) {
  if (heap.length < 133) heap.push(heap.pop());
  const idx = heap.length - 1;
  heap[idx] = obj;
  return idx;
}

export class FactorAnalysis {
  static __wrap(ptr) {
    const obj = Object.create(FactorAnalysis.prototype);
    obj.__wbg_ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_factoranalysis_free(ptr, 1);
  }

  constructor(target_data, value_target_data, target_data_defs, value_target_data_defs, config_data) {
    if (wasm && wasm.factoranalysis_new) {
      const ret = wasm.factoranalysis_new(addHeapObject(target_data), addHeapObject(value_target_data), addHeapObject(target_data_defs), addHeapObject(value_target_data_defs), addHeapObject(config_data));
      this.__wbg_ptr = ret[0];
    } else {
      throw new Error('FactorAnalysis WASM module not loaded. Please compile the Rust code with: wasm-pack build --target web');
    }
  }

  get_results() {
    if (!wasm || !wasm.factoranalysis_get_results) {
      throw new Error('FactorAnalysis WASM module not loaded');
    }
    const ret = wasm.factoranalysis_get_results(this.__wbg_ptr);
    return getObject(ret[0]);
  }

  get_formatted_results() {
    if (!wasm || !wasm.factoranalysis_get_formatted_results) {
      throw new Error('FactorAnalysis WASM module not loaded');
    }
    const ret = wasm.factoranalysis_get_formatted_results(this.__wbg_ptr);
    return getObject(ret[0]);
  }

  get_all_errors() {
    if (!wasm || !wasm.factoranalysis_get_all_errors) {
      throw new Error('FactorAnalysis WASM module not loaded');
    }
    const ret = wasm.factoranalysis_get_all_errors(this.__wbg_ptr);
    return getObject(ret);
  }

  clear_errors() {
    if (!wasm || !wasm.factoranalysis_clear_errors) {
      throw new Error('FactorAnalysis WASM module not loaded');
    }
    const ret = wasm.factoranalysis_clear_errors(this.__wbg_ptr);
    return getObject(ret);
  }
}

export async function init(module) {
  if (wasm !== undefined) return wasm;

  if (module === undefined) {
    throw new Error('FactorAnalysis WASM module requires compilation. Run: wasm-pack build --target web in frontend/components/Modals/Analyze/dimension-reduction/factor/rust/');
  }

  const imports = {
    env: {
      alert: console.log,
    },
  };

  if (module instanceof WebAssembly.Module) {
    const instance = new WebAssembly.Instance(module, imports);
    return init(instance);
  } else if (typeof module === 'string' || (typeof Request === 'function' && module instanceof Request) || (typeof URL === 'function' && module instanceof URL)) {
    const response = await fetch(module);
    if (!response.ok) throw new Error('failed to fetch wasm module');
    const buffer = await response.arrayBuffer();
    return init(await WebAssembly.instantiate(buffer, imports));
  } else if (module instanceof WebAssembly.Instance) {
    wasm = module.exports;
    return wasm;
  }

  throw new Error('FactorAnalysis WASM module not loaded');
}

export default init;
