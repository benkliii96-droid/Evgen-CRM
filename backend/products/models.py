from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class UnitGroup(models.Model):
    """Группа единиц измерения (Вес, Длина, Объём и т.д.)"""
    name = models.CharField('Название группы', max_length=50, unique=True)
    slug = models.SlugField('Идентификатор', unique=True)
    description = models.TextField('Описание', blank=True)
    icon = models.CharField('Иконка (emoji)', max_length=10, default='📏')
    sort_order = models.PositiveIntegerField('Сортировка', default=0)
    is_active = models.BooleanField('Активна', default=True)
    
    class Meta:
        verbose_name = 'Группа единиц'
        verbose_name_plural = 'Группы единиц'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name
    
    @property
    def units_count(self):
        return self.units.count()


class Unit(models.Model):
    """Единица измерения"""
    name = models.CharField('Название', max_length=50)
    short_name = models.CharField('Сокращение', max_length=10)  # кг, г, м, см
    plural_name = models.CharField('Множественное число', max_length=50, blank=True)  # килограммы
    group = models.ForeignKey(UnitGroup, on_delete=models.CASCADE, related_name='units', verbose_name='Группа')
    ratio_to_base = models.DecimalField('Коэффициент к базовой', max_digits=12, decimal_places=6, default=1, 
                                         help_text='Например: для грамма = 0.001 (кг базовая), для тонны = 1000')
    is_base = models.BooleanField('Базовая в группе', default=False, help_text='Базовая единица, к которой приводятся остальные')
    is_default = models.BooleanField('По умолчанию', default=False, help_text='Использовать по умолчанию для новых товаров')
    sort_order = models.PositiveIntegerField('Сортировка', default=0)
    is_active = models.BooleanField('Активна', default=True)
    
    class Meta:
        verbose_name = 'Единица измерения'
        verbose_name_plural = 'Единицы измерения'
        ordering = ['sort_order', 'name']
        unique_together = ['group', 'short_name']
    
    def __str__(self):
        return f"{self.name} ({self.short_name})"
    
    def clean(self):
        # Только одна базовая единица в группе
        if self.is_base:
            existing_base = Unit.objects.filter(group=self.group, is_base=True).exclude(pk=self.pk)
            if existing_base.exists():
                raise ValidationError({'is_base': 'В группе уже есть базовая единица'})
    
    def save(self, *args, **kwargs):
        if self.is_base:
            # Сбрасываем базовую у других единиц в группе
            Unit.objects.filter(group=self.group, is_base=True).exclude(pk=self.pk).update(is_base=False)
        if self.is_default:
            # Сбрасываем default у других единиц в группе
            Unit.objects.filter(group=self.group, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
    
    def convert_to(self, target_unit, value):
        """Конвертировать значение в другую единицу той же группы"""
        if target_unit.group_id != self.group_id:
            raise ValueError('Единицы из разных групп')
        # Сначала приводим к базовой, потом к целевой
        base_value = float(value) * float(self.ratio_to_base)
        target_ratio = float(target_unit.ratio_to_base)
        return base_value / target_ratio if target_ratio else base_value
    
    @property
    def display_name(self):
        """Краткое название для отображения"""
        return self.short_name


class Category(models.Model):
    name = models.CharField('Название', max_length=100)
    slug = models.SlugField('URL-идентификатор', max_length=100, unique=True, null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, verbose_name='Родительская категория', related_name='children', null=True, blank=True)
    icon = models.ImageField('Иконка', upload_to='categories/icons/', blank=True, null=True)
    description = models.TextField('Описание', blank=True)
    is_active = models.BooleanField('Активна', default=True)
    sort_order = models.PositiveIntegerField('Сортировка', default=0)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    # Связь с группами единиц
    allowed_unit_groups = models.ManyToManyField(UnitGroup, related_name='allowed_categories', verbose_name='Разрешённые группы единиц', blank=True)
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['sort_order', 'name']
        unique_together = ['slug', 'parent']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            self.slug = base_slug
            # Если слаг уже существует, добавляем число
            from django.db import transaction
            with transaction.atomic():
                if Category.objects.filter(slug=self.slug).exists():
                    counter = 1
                    while Category.objects.filter(slug=f"{base_slug}-{counter}").exists():
                        counter += 1
                    self.slug = f"{base_slug}-{counter}"
        super().save(*args, **kwargs)
    
    @property
    def full_path(self):
        """Полный путь категории (для хлебных крошек)"""
        path = [self.name]
        parent = self.parent
        while parent:
            path.insert(0, parent.name)
            parent = parent.parent
        return ' / '.join(path)
    
    @property
    def depth(self):
        """Глубина вложенности"""
        depth = 0
        parent = self.parent
        while parent:
            depth += 1
            parent = parent.parent
        return depth
    
    def get_all_fields(self):
        """Получить все поля категории (включая родительские)"""
        fields = list(self.fields.all().order_by('sort_order'))
        if self.parent:
            # Добавляем поля родителя (без тех, что переопределены)
            parent_fields = self.parent.get_all_fields()
            existing_slugs = {f.slug for f in fields}
            for pf in parent_fields:
                if pf.slug not in existing_slugs:
                    fields.append(pf)
        return fields

    def get_allowed_units(self):
        """Получить допустимые единицы для категории (включая родительские)"""
        # Сначала пробуем получить из CategoryUnit
        category_units = CategoryUnit.objects.filter(
            category=self,
            unit__is_active=True
        ).select_related('unit', 'unit__group').order_by('sort_order', 'unit__name')

        if category_units.exists():
            units = [cu.unit for cu in category_units]
            default_unit = next((cu.unit for cu in category_units if cu.is_default), units[0] if units else None)
            return units, default_unit
        
        # Если нет явных настроек - берём из групп единиц
        groups = self.allowed_unit_groups.filter(is_active=True)
        if groups.exists():
            units = list(Unit.objects.filter(
                group__in=groups,
                is_active=True
            ).select_related('group').order_by('group__sort_order', 'sort_order', 'name'))
            default_unit = next((u for u in units if u.is_default), units[0] if units else None)
            return units, default_unit
        
        # Если ничего не настроено - берём всё активное
        units = list(Unit.objects.filter(is_active=True).select_related('group').order_by('group__sort_order', 'sort_order', 'name'))
        default_unit = next((u for u in units if u.is_default), units[0] if units else None)
        return units, default_unit
    
    def get_allowed_unit_groups(self):
        """Получить допустимые группы единиц (включая родительские)"""
        groups = list(self.allowed_unit_groups.filter(is_active=True))
        
        # Добавляем группы родителя
        if self.parent:
            parent_groups = self.parent.get_allowed_unit_groups()
            existing_ids = {g.id for g in groups}
            for pg in parent_groups:
                if pg.id not in existing_ids:
                    groups.append(pg)
        
        return groups


class CategoryUnit(models.Model):
    """Допустимые единицы для категории"""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='allowed_units')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='allowed_categories')
    is_default = models.BooleanField('По умолчанию', default=False)
    sort_order = models.PositiveIntegerField('Сортировка', default=0)
    
    class Meta:
        verbose_name = 'Допустимая единица для категории'
        verbose_name_plural = 'Допустимые единицы для категорий'
        unique_together = ['category', 'unit']
        ordering = ['sort_order', 'unit__name']
    
    def __str__(self):
        return f"{self.category.name} - {self.unit.name}"


class ProductField(models.Model):
    FIELD_TYPES = [
        ('text', 'Текст (однострочный)'),
        ('textarea', 'Текст (многострочный)'),
        ('number', 'Число'),
        ('decimal', 'Десятичное число'),
        ('boolean', 'Да/Нет (checkbox)'),
        ('select', 'Выбор из списка'),
        ('multiselect', 'Множественный выбор'),
        ('date', 'Дата'),
        ('datetime', 'Дата и время'),
        ('image', 'Изображение'),
        ('file', 'Файл'),
        ('url', 'Ссылка'),
        ('email', 'Email'),
        ('phone', 'Телефон'),
        ('color', 'Цвет'),
        ('range', 'Диапазон'),
    ]
    
    name = models.CharField('Название поля', max_length=100)
    slug = models.SlugField('Идентификатор', max_length=100, null=True, blank=True)
    field_type = models.CharField('Тип поля', max_length=20, choices=FIELD_TYPES)
    description = models.TextField('Описание', blank=True)
    placeholder = models.CharField('Подсказка', max_length=200, blank=True)
    
    # Настройки для разных типов
    options = models.JSONField('Параметры', default=dict, blank=True, help_text='{"choices": ["A", "B"], "min": 0, "max": 100}')
    default_value = models.JSONField('Значение по умолчанию', null=True, blank=True)
    
    # Валидация
    required = models.BooleanField('Обязательное', default=False)
    min_value = models.DecimalField('Минимум', max_digits=12, decimal_places=2, null=True, blank=True)
    max_value = models.DecimalField('Максимум', max_digits=12, decimal_places=2, null=True, blank=True)
    min_length = models.PositiveIntegerField('Мин. длина', null=True, blank=True)
    max_length = models.PositiveIntegerField('Макс. длина', null=True, blank=True)
    pattern = models.CharField('Регулярное выражение', max_length=500, blank=True)
    
    # Отображение
    sort_order = models.PositiveIntegerField('Сортировка', default=0)
    is_filterable = models.BooleanField('Использовать в фильтре', default=False)
    is_visible = models.BooleanField('Показывать в карточке', default=True)
    unit = models.CharField('Единица измерения', max_length=50, blank=True)
    
    # Связь с категориями
    categories = models.ManyToManyField(Category, related_name='fields', verbose_name='Категории')
    
    class Meta:
        verbose_name = 'Поле товара'
        verbose_name_plural = 'Поля товаров'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_field_type_display()})"
    
    def get_options(self):
        """Получить options как словарь с дефолтными значениями"""
        defaults = {
            'text': {'min_length': 0, 'max_length': 500},
            'textarea': {'min_length': 0, 'max_length': 5000},
            'number': {'min': None, 'max': None, 'step': 1},
            'decimal': {'min': None, 'max': None, 'step': 0.01},
            'select': {'choices': []},
            'multiselect': {'choices': [], 'max_selections': None},
            'date': {},
            'datetime': {},
            'range': {'min': 0, 'max': 100, 'step': 1},
            'color': {'format': 'hex'},
        }
        return {**defaults.get(self.field_type, {}), **(self.options or {})}


class ProductFieldValue(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='field_values')
    field = models.ForeignKey(ProductField, on_delete=models.CASCADE, related_name='values')
    value = models.JSONField('Значение')
    
    class Meta:
        verbose_name = 'Значение поля'
        verbose_name_plural = 'Значения полей'
        unique_together = ['product', 'field']
    
    def __str__(self):
        return f"{self.product.name} - {self.field.name}: {self.value}"


class Product(models.Model):
    name = models.CharField('Наименование', max_length=200)
    slug = models.SlugField('URL-идентификатор', max_length=100, blank=True, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категория', related_name='products')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, verbose_name='Добавил', related_name='products', null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, verbose_name='Единица измерения', related_name='products', null=True, blank=True)
    quantity = models.PositiveIntegerField('Количество', default=1)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    has_discount = models.BooleanField('Есть скидка', default=False)
    discount_percent = models.PositiveSmallIntegerField('Процент скидки', default=0)
    description = models.TextField('Описание', blank=True)
    image = models.ImageField('Изображение', upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    @property
    def unit_display(self):
        """Краткое название единицы для отображения"""
        return self.unit.short_name if self.unit else 'шт'
    
    @property
    def total(self):
        discount = self.discount_percent if self.has_discount else 0
        return float(self.quantity) * float(self.price) * (1 - discount / 100)
