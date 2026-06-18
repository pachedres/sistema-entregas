from abc import ABC, abstractmethod


class IEventPublisher(ABC):
    @abstractmethod
    async def publicar(self, evento: str, dados: dict) -> None: ...
