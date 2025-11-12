import { queryEntities } from '@skyboxgg/bjs-ecs';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Rotator } from './components';

// Для надежности мы можем определить тип нашей сущности
type RotatableEntity = TransformNode & {
    rotator: { speed: number };
};

export const RotationSystem = (deltaTime: number) => {
    // Запрос остается прежним, но теперь мы знаем, что он вернет
    const entities = queryEntities([TransformNode, Rotator]) as RotatableEntity[];

    // ГЛАВНОЕ ИЗМЕНЕНИЕ:
    // У сущности нет метода .get(). Компоненты - это свойства.
    // Сама сущность - это и есть TransformNode, а данные 'rotator' добавлены к ней.
    for (const entity of entities) {
        entity.rotation.y += entity.rotator.speed * deltaTime;
    }
};