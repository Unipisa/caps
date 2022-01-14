<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */

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