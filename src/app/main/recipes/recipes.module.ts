import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';
import { NewRecipeComponent } from './new-recipe/new-recipe.component';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';
import { ReactiveFormsModule } from '@angular/forms';

export const routes: Routes = [
  {path:'list', component:RecipeListComponent},
  {path:'edit', component:EditRecipeComponent},
  {path:'new', component:NewRecipeComponent},
  {path:'view', component:ViewRecipeComponent},
  {
    path: '',
    redirectTo:'list',
    pathMatch:'full'
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes), ReactiveFormsModule
  ]
})
export class RecipesModule { }
