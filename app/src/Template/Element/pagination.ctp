<ul class="caps-pagination">
    <?php echo $this->Paginator->prev(
        '&laquo;',
        ['escape' => false],
        '&laquo;',
        ['class' => 'caps-pagination-disabled',
            'escape' => false,]
    ); ?>
    <?php echo $this->Paginator->numbers(); ?>
    <?php echo $this->Paginator->next(
        '&raquo;',
        ['escape' => false],
        '&raquo;',
        ['class' => 'caps-pagination-disabled',
            'escape' => false,]
    ); ?>
</ul>
