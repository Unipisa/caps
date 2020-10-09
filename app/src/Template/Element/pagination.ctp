<div class="row d-flex">
    <div class="flex-fill"></div>
    <div class="col-auto">
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <?php echo $this->Paginator->prev(
                    'Previous',
                    [ 'class' => 'page-item' ]
                ); ?>
                <?php echo $this->Paginator->numbers(); ?>
                <?php echo $this->Paginator->next(
                    'Next',
                    [ 'class' => 'page-item' ]
                ); ?>
            </ul>
        </nav>
    </div>
    <div class="flex-fill"></div>
</div>
