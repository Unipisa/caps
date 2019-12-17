<ul class="caps-pagination">
    <?php echo $this->Paginator->prev(
        '&laquo;',
        array('escape' => false),
        '&laquo;',
        array(
            'class' => 'caps-pagination-disabled',
            'escape' => false,
        )
    ); ?>
    <?php echo $this->Paginator->numbers(); ?>
    <?php echo $this->Paginator->next(
        '&raquo;',
        array('escape' => false),
        '&raquo;',
        array(
            'class' => 'caps-pagination-disabled',
            'escape' => false,
        )
    ); ?>
</ul>
