<?php

return [
    'nextActive' => '<li class="page-item next"><a class="page-link" rel="next" href="{{url}}">{{text}}</a></li>',
    'nextDisabled' => '<li class="page-item next disabled"><a class="page-link"  href="" onclick="return false;">{{text}}</a></li>',
    'prevActive' => '<li class="page-item prev"><a class="page-link"  rel="prev" href="{{url}}">{{text}}</a></li>',
    'prevDisabled' => '<li class="page-item prev disabled"><a class="page-link"  href="" onclick="return false;">{{text}}</a></li>',
    'counterRange' => '{{start}} - {{end}} of {{count}}',
    'counterPages' => '{{page}} of {{pages}}',
    'first' => '<li class="page-item"><a class="page-link"  href="{{url}}">{{text}}</a></li>',
    'last' => '<li class="page-item"><a class="page-link"  href="{{url}}">{{text}}</a></li>',
    'number' => '<li class="page-item"><a class="page-link"  href="{{url}}">{{text}}</a></li>',
    'current' => '<li class="page-item active"><a class="page-link"  href="">{{text}}</a></li>',
    'ellipsis' => '<li class="page-item ellipsis">&hellip;</li>',
    'sort' => '<a href="{{url}}">{{text}}</a>',
    'sortAsc' => '<a href="{{url}}"><i class="fw fas fa-arrow-down mr-2"></i>{{text}}</a>',
    'sortDesc' => '<a href="{{url}}"><i class="fw fas fa-arrow-up mr-2"></i>{{text}}</a>',
    'sortAscLocked' => '<a class="locked" href="{{url}}"><i class="fw fas fa-arrow-down mr-2"></i>{{text}}</a>',
    'sortDescLocked' => '<a class="locked" href="{{url}}"><i class="fw fas fa-arrow-up mr-2"></i>{{text}}</a>',

];

?>
