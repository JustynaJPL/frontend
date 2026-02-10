import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';

export const routes: Routes = [
  {path:'list', component:RecipeListComponent},
  {path:'view/:id', component:ViewRecipeComponent},
  {
    path: '',
    redirectTo:'list',
    pathMatch:'full'
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class NlrecipesModule { }
