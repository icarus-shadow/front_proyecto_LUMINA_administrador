import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchUsers } from '../redux/slices/data/UsersSlice';
import { fetchElements } from '../redux/slices/data/elementsSlice';
import { fetchHistory } from '../redux/slices/data/historySlice';
import { fetchSubElements } from '../redux/slices/data/subElementsSlice';
import { fetchLevelFormations } from '../redux/slices/data/LevelFormationSlice';
import { fetchFormations } from '../redux/slices/data/formationSlice';

/**
 * Componente que carga todos los datos necesarios de Redux al iniciar la aplicación
 * Este componente se monta una vez y dispara todas las acciones de fetch necesarias
 */
export default function SliceEffects() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Cargar todos los datos en paralelo al montar el componente
        const loadAllData = async () => {
            try {
                // Dispatch de todas las acciones en paralelo para mejor rendimiento
                await Promise.all([
                    dispatch(fetchElements()),
                    dispatch(fetchUsers()),
                    dispatch(fetchHistory()),
                    dispatch(fetchSubElements()),
                    dispatch(fetchFormations()),
                    dispatch(fetchLevelFormations())
                ]);

            } catch (error) {
                console.error('❌ Error al cargar datos iniciales:', error);
            }
        };

        loadAllData();
    }, [dispatch]);

    // Este componente no renderiza nada visible
    return null;
}