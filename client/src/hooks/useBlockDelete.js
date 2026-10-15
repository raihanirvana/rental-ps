import { useState } from 'react';
import { deleteBlock } from '../lib/owner-api.js';
import { useAsyncAction } from './useAsyncAction.js';

export function useBlockDelete(onDeleted) {
  const [target, setTarget] = useState(null);
  const action = useAsyncAction();
  const confirm = async () => {
    const result = await action.run(() => deleteBlock(target.id));
    if (result) {
      setTarget(null);
      onDeleted(result.block);
    }
  };
  const ask = (block) => {
    action.reset();
    setTarget(block);
  };
  const close = () => !action.busy && setTarget(null);
  return { target, busy: action.busy, error: action.error, ask, close, confirm };
}
