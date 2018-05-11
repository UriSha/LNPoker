class Player:
    def __init__(self, id, name, money, serial):
        self._id = id
        self._name = name
        self._money = money
        self._serial = serial

    @property
    def id(self):
        return self._id

    @property
    def name(self):
        return self._name

    @property
    def money(self):
        return self._money

    @property
    def serial(self):
        return self._serial

    def dto(self):
        return {
            "id": self.id,
            "name": self.name,
            "money": self.money,
            "serial": self.serial
        }

    def take_money(self, money):
        if money > self._money:
            raise ValueError("Player does not have enough money")
        if money < 0.0:
            raise ValueError("Money has to be a positive amount")
        self._money -= money

    def add_money(self, money):
        if money <= 0.0:
            raise ValueError("Money has to be a positive amount")
        self._money += money

    def __str__(self):
        return "player {}".format(self._id)
